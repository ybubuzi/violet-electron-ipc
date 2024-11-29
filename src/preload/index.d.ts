import { ElectronAPI } from '@electron-toolkit/preload';
import type * as IPC from '@/main/notify/types';

type HandleLike = typeof import('@/main/ipc/handles');
type HandleApi = DeepHandleApi<HandleLike>;
type ExcludeIpcEvent<T extends Function> = Exclude<Parameters<T>, import('electron').IpcMainInvokeEvent>;
type ApiInvokeFunction<T extends Function> = (...args: ExcludeIpcEvent<T>) => Promise<ReturnType<T>>;
type DeepHandleApi<T extends Object> = {
  [key in keyof T]: T[key] extends Function ? ApiInvokeFunction<T[key]> : DeepHandleApi<T[key]>;
};

type NotifyCallback<T extends IPC.NotifyEvent> = (...params: DestructionTuple<IPC.NotifyTypeMap[T]>) => void;
interface Notify {
  addListener<T extends IPC.NotifyEvent>(event: T, callback: NotifyCallback<T>);
  removeListener<T extends IPC.NotifyEvent>(event: T, callback: NotifyCallback<T>);
  removeAllListeners<T extends IPC.NotifyEvent>(event: T);
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: HandleApi;
    notify: Notify;
  }
}
