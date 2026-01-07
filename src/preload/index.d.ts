import { ElectronAPI } from "@electron-toolkit/preload";
import type * as IPC from "@/main/notify/types";

type UnwrapPromise<T> =
  T extends Promise<infer R> ? (R extends Promise<infer RT> ? UnwrapPromise<R> : R) : T;
type HandleLike = typeof import("@/main/ipc/handles");
type HandleApi = DeepHandleApi<HandleLike>;
type ExcludeIpcEvent<T extends AnyFunction> = Exclude<
  Parameters<T>,
  import("electron").IpcMainInvokeEvent
>;
type ApiInvokeFunction<T extends AnyFunction> = (
  ...args: ExcludeIpcEvent<T>
) => Promise<UnwrapPromise<ReturnType<T>>>;
type DeepHandleApi<T extends Object> = {
  [key in keyof T]: T[key] extends AnyFunction
    ? ApiInvokeFunction<T[key]>
    : T[key] extends Object
      ? DeepHandleApi<T[key]>
      : never;
};

interface Notify {
  addListener<T extends IPC.NotifyEvent>(event: T, callback: IPC.NotifyCallback<T>): void;
  removeListener<T extends IPC.NotifyEvent>(event: T, callback: IPC.NotifyCallback<T>): void;
  removeAllListeners<T extends IPC.NotifyEvent>(event: T): void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: HandleApi;
    notify: Notify;
  }
}
