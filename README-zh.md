# Violet Electron IPC 框架

一个功能强大且设计优雅的 Electron IPC（进程间通信）框架，旨在简化主进程与渲染器进程之间的通信。它利用现代 JavaScript 特性，提供无缝、类似类型安全且无需繁琐样板代码的开发体验。

[English](./README.md)

## 核心原则

该框架建立在几个核心原则之上：

1.  **约定优于配置**：基于文件结构，API 会自动从主进程暴露给渲染器进程。无需为每个 IPC 通道手动注册。
2.  **动态代理客户端**：渲染器进程使用动态 `Proxy` 创建一个镜像主进程 API 的客户端。这使您可以像调用本地方法一样调用主进程函数：`api.module.function()`。
3.  **隐式上下文传播**：利用 Node.js 的 `AsyncLocalStorage`，`IpcMainInvokeEvent` 在 IPC 处理程序的整个调用堆栈中隐式可用，允许任何函数访问发送方的 `BrowserWindow`，而无需手动传递事件对象。
4.  **无内存泄漏的通知系统**：一个发布/订阅系统，使用 `WeakRef` 自动管理渲染器中事件监听器的生命周期。当一个组件（如 Vue 组件）被垃圾回收时，其监听器会自动被移除，从而防止常见的内存泄漏。

## 项目结构

IPC 逻辑主要包含在以下位置：

```
src/
├── main/
│   └── ipc/                # 主进程 API 模块在此定义
│       ├── handles.ts      # 聚合所有 API 模块
│       ├── index.ts        # 核心：扫描模块并设置 ipcMain.handle
│       └── ctx.ts          # 核心：使用 AsyncLocalStorage 管理上下文
│
├── preload/
│   └── index.ts            # 向渲染器暴露 IPC API
│
└── renderer/
    └── handle.ts           # 核心：渲染器的代理客户端实现
```

-   **`src/main/ipc/`**：在这里定义您的主进程 API。每个文件或文件夹代表一个模块。框架会自动发现并暴露任何导出的函数。
-   **`src/renderer/handle.ts`**：此文件包含实现魔法的客户端代理逻辑。通常您不需要修改此文件。

## 如何使用

### 1. 定义主进程 API

要向渲染器进程暴露一个函数，只需在 `src/main/ipc/` 内创建一个文件。文件路径决定了 API 路径。

**示例：创建一个 `greeter` API。**

创建一个新文件 `src/main/ipc/greeter.ts`：

```typescript
// src/main/ipc/greeter.ts

export function sayHello(name: string): string {
  return `你好, ${name}! 这条消息来自主进程。`;
}

export function sayGoodbye(): string {
  return '再见!';
}
```

框架将自动创建两个 IPC 处理器：
- `greeter-sayHello`
- `greeter-sayGoodbye`

在主进程中，您无需执行任何其他操作！

### 2. 从渲染器调用 API

在您的渲染器代码中（例如，一个 Vue 组件），您现在可以直接在全局 `api` 对象上调用这些函数。`Proxy` 会为您处理 `ipcRenderer.invoke` 调用。

```vue
<!-- src/renderer/src/components/MyComponent.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const greeting = ref('');

onMounted(async () => {
  // 像调用本地函数一样调用主进程 API
  greeting.value = await window.api.greeter.sayHello('开发者');
  
  // 嵌套模块示例
  // 如果您有 src/main/ipc/message/shy-girl.ts
  const message = await window.api.message.shy.startle('Boo!');
  console.log(message); // "radiant star: Boo!"
});
</script>

<template>
  <p>{{ greeting }}</p>
</template>
```

### 3. 使用通知系统

通知系统允许主进程向渲染器推送事件。得益于 `WeakRef`，渲染器端的监听器会自动被清理。

**主进程：发送通知**

（假设您在主进程中有一个可用的 `sendNotify` 函数）

```typescript
// 在某个主进程文件中，例如下载完成后
import { sendNotify } from '@/main/notify';

function onDownloadComplete(filePath: string) {
  // 向所有监听窗口发送通知
  sendNotify('download-complete', { path: filePath, status: 'success' });
}
```

**渲染器进程：监听通知**

在 Vue 组件中，在 `onMounted` 内部使用 `window.notify.addListener`。当组件被销毁时，监听器将被自动移除。

```vue
<!-- src/renderer/src/components/DownloadStatus.vue -->
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const status = ref('等待下载中...');

function onDownloadUpdate(data: { path: string, status: string }) {
  console.log(`下载完成:`, data);
  status.value = `文件已下载到 ${data.path}`;
  
  // 无需手动移除监听器，但如果需要也可以手动移除。
}

onMounted(() => {
  // 监听器会自动绑定到组件的生命周期
  window.notify.addListener('download-complete', onDownloadUpdate);
});

// onUnmounted 对于清理不是必需的！
</script>

<template>
  <div>{{ status }}</div>
</template>
```

## 优化打包：分离 `node_modules`

为了提升性能并实现更高效的更新，本项目配置为将最终打包的应用程序拆分为两个独立的 `asar` 归档文件：

-   `app.asar`：仅包含您的应用程序源代码。
-   `deps.asar`：包含所有的 `node_modules` 依赖项。

这种分离带来了两个主要优势：

1.  **更快的启动速度**：Electron 可以更快地加载较小的 `app.asar`。
2.  **高效的更新**：当您发布新版本的应用程序时，用户通常只需要下载已更改的 `app.asar`，这比单个大型归档文件要小得多。

### 工作原理

拆分过程由一个自定义的构建流程处理：

1.  **`config/electron-build/split-asar-builder.mjs`**：这是自定义构建的入口点。它使用特殊配置调用 `electron-builder`。
2.  **`config/electron-build/split-asar-builder-handle.cjs`**：在 `electron-builder` 打包应用程序后，此脚本接管。它找到 `node_modules` 目录，将其归档到 `deps.asar`，移除原始的 `node_modules` 文件夹，然后将剩余的应用程序源代码打包到 `app.asar`。
3.  **`config/vite-plugin/split-deps-loader.vite.config.ts`**：这个 Vite 插件将一个小型的加载器脚本注入到主进程的入口文件（`index.js`）中。
4.  **`config/electron-build/split-asar-builder-dep-loader.cjs`**：这是被注入的加载器脚本。它在任何其他应用程序代码之前运行，并覆盖 Node.js 的 `Module._load` 函数。它教会 Node.js 如何在 `deps.asar` 归档文件中查找依赖项。

### 启用分离打包

要创建启用 `asar` 拆分的构建，请运行以下命令：

```bash
npm run build:tiny:win
```

这将在 `out/` 目录中生成最终的应用程序，其中 `app.asar` 和 `deps.asar` 位于 `resources` 文件夹内。
