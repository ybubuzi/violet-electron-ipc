[Read in Chinese](./README-zh.md)

# Violet Electron IPC Framework

A powerful and elegant IPC (Inter-Process Communication) framework for Electron, designed to simplify communication between the main and renderer processes. It leverages modern JavaScript features to provide a seamless, type-safe-like, and boilerplate-free developer experience.

## Core Principles

This framework is built on a few core principles:

1.  **Convention over Configuration**: APIs are automatically exposed from the main process to the renderer process based on their file structure. There's no need to manually register every IPC channel.
2.  **Dynamic Proxy Client**: The renderer process uses a dynamic `Proxy` to create a client that mirrors the main process API. This allows you to call main process functions as if they were local methods: `api.module.function()`.
3.  **Implicit Context Propagation**: Using Node.js `AsyncLocalStorage`, the `IpcMainInvokeEvent` is implicitly available in the entire call stack of an IPC handler, allowing any function to access the sender's `BrowserWindow` without manually passing the event object around.
4.  **Leak-Free Notification System**: A pub/sub system that uses `WeakRef` to automatically manage the lifecycle of event listeners in the renderer. When a component (like a Vue component) is garbage-collected, its listeners are automatically removed, preventing common memory leaks.

## Project Structure

The IPC logic is primarily contained in these locations:

```
src/
├── main/
│   └── ipc/                # Main process API modules are defined here
│       ├── handles.ts      # Aggregates all API modules
│       ├── index.ts        # Core: Scans modules and sets up ipcMain.handle
│       └── ctx.ts          # Core: Manages context with AsyncLocalStorage
│
├── preload/
│   └── index.ts            # Exposes the IPC API to the renderer
│
└── renderer/
    └── handle.ts           # Core: The Proxy client implementation for the renderer
```

-   **`src/main/ipc/`**: This is where you define your main process APIs. Each file or folder represents a module. The framework automatically discovers and exposes any exported functions.
-   **`src/renderer/handle.ts`**: This file contains the client-side proxy logic that makes the magic happen. You generally won't need to touch this file.

## How to Use

### 1. Defining a Main Process API

To expose a function to the renderer process, simply create a file inside `src/main/ipc/`. The file path determines the API path.

**Example: Create a `greeter` API.**

Create a new file `src/main/ipc/greeter.ts`:

```typescript
// src/main/ipc/greeter.ts

export function sayHello(name: string): string {
  return `Hello, ${name}! This message is from the main process.`;
}

export function sayGoodbye(): string {
  return 'Goodbye!';
}
```

The framework will automatically create two IPC handlers:
- `greeter-sayHello`
- `greeter-sayGoodbye`

You don't need to do anything else in the main process!

### 2. Calling the API from the Renderer

In your renderer code (e.g., a Vue component), you can now call these functions directly on the global `api` object. The `Proxy` will handle the `ipcRenderer.invoke` call for you.

```vue
<!-- src/renderer/src/components/MyComponent.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const greeting = ref('');

onMounted(async () => {
  // Call the main process API as if it were a local function
  greeting.value = await window.api.greeter.sayHello('Developer');
  
  // Example with nested modules
  // If you had src/main/ipc/message/shy-girl.ts
  const message = await window.api.message.shy.startle('Boo!');
  console.log(message); // "radiant star: Boo!"
});
</script>

<template>
  <p>{{ greeting }}</p>
</template>
```

### 3. Using the Notification System

The notification system allows the main process to push events to the renderer. The renderer-side listeners are automatically cleaned up thanks to `WeakRef`.

**Main Process: Sending a Notification**

(Assuming you have a `sendNotify` function available in the main process)

```typescript
// In some main process file, e.g., after a download is complete
import { sendNotify } from '@/main/notify';

function onDownloadComplete(filePath: string) {
  // Send a notification to all listening windows
  sendNotify('download-complete', { path: filePath, status: 'success' });
}
```

**Renderer Process: Listening for a Notification**

In a Vue component, use `window.notify.addListener` inside `onMounted`. The listener will be automatically removed when the component is destroyed.

```vue
<!-- src/renderer/src/components/DownloadStatus.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const status = ref('Waiting for downloads...');

function onDownloadUpdate(data: { path: string, status: string }) {
  console.log(`Download completed:`, data);
  status.value = `File downloaded to ${data.path}`;
  
  // No need to manually remove the listener, but you can if needed.
}

onMounted(() => {
  // The listener is automatically tied to the component's lifecycle
  window.notify.addListener('download-complete', onDownloadUpdate);
});

// onUnmounted is not required for cleanup!
</script>

<template>
  <div>{{ status }}</div>
</template>
```

## Optimized Packaging: Splitting `node_modules`

To improve performance and enable more efficient updates, this project is configured to split the final packaged application into two separate `asar` archives:

-   `app.asar`: Contains only your application's source code.
-   `deps.asar`: Contains all of the `node_modules` dependencies.

This separation provides two main advantages:

1.  **Faster Startup**: Electron can load the smaller `app.asar` more quickly.
2.  **Efficient Updates**: When you release a new version of your app, users often only need to download the changed `app.asar`, which is significantly smaller than a single, large archive.

### How It Works

The splitting process is handled by a custom build pipeline:

1.  **`config/electron-build/split-asar-builder.mjs`**: This is the entry point for the custom build. It calls `electron-builder` with a special configuration.
2.  **`config/electron-build/split-asar-builder-handle.cjs`**: After `electron-builder` packages the application, this script takes over. It finds the `node_modules` directory, archives it into `deps.asar`, removes the original `node_modules` folder, and then packages the remaining app source into `app.asar`.
3.  **`config/vite-plugin/split-deps-loader.vite.config.ts`**: This Vite plugin injects a small loader script into the main process's entry file (`index.js`).
4.  **`config/electron-build/split-asar-builder-dep-loader.cjs`**: This is the injected loader script. It runs before any other application code and overrides Node.js's `Module._load` function. It teaches Node.js how to look for dependencies inside the `deps.asar` archive.

### Building with Splitting Enabled

To create a build with the `asar` splitting, run the following command:

```bash
npm run build:tiny:win
```

This will generate the final application in the `out/` directory, with `app.asar` and `deps.asar` inside the `resources` folder.
