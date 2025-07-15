import { ElectronAPI } from '@electron-toolkit/preload';
import type * as IPC from '@/main/notify/types';

type UnwrapPromise<T> = T extends Promise<infer R> ? (R extends Promise<infer RT> ? UnwrapPromise<R> : R) : T;
type HandleLike = typeof import('@/main/ipc/handles');
type HandleApi = DeepHandleApi<HandleLike>;
type ExcludeIpcEvent<T extends Function> = Exclude<Parameters<T>, import('electron').IpcMainInvokeEvent>;
type ApiInvokeFunction<T extends Function> = (...args: ExcludeIpcEvent<T>) => Promise<UnwrapPromise<ReturnType<T>>>;
type DeepHandleApi<T extends Object> = {
  [key in keyof T]: T[key] extends Function ? ApiInvokeFunction<T[key]> : DeepHandleApi<T[key]>;
};

interface Notify {
  addListener<T extends IPC.NotifyEvent>(event: T, callback: IPC.NotifyCallback<T>);
  removeListener<T extends IPC.NotifyEvent>(event: T, callback: IPC.NotifyCallback<T>);
  removeAllListeners<T extends IPC.NotifyEvent>(event: T);
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: HandleApi;
    notify: Notify;
  }
}
