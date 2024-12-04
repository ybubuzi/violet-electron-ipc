import { ElectronAPI } from '@electron-toolkit/preload';
import type * as IPC from '@/main/notify/types';

type HandleLike = typeof import('@/main/ipc/handles');
type HandleApi = DeepHandleApi<HandleLike>;
type ExcludeIpcEvent<T extends Function> = Exclude<Parameters<T>, import('electron').IpcMainInvokeEvent>;
type ApiInvokeFunction<T extends Function> = (...args: ExcludeIpcEvent<T>) => Promise<ReturnType<T>>;
type DeepHandleApi<T extends Object> = {
  [key in keyof T]: T[key] extends Function ? ApiInvokeFunction<T[key]> : DeepHandleApi<T[key]>;
};

interface Notify {
  addListener<T extends IPC.NotifyEvent>(event: T, callback: IPC.NotifyCallback<T>);
  removeListener<T extends IPC.NotifyEvent>(event: T, callback: IPC.NotifyCallback<T>);
  removeAllListeners<T extends IPC.NotifyEvent>(event: T);
}

import type { ControllerApi } from './ControllerApi';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: HandleApi & ControllerApi;
    notify: Notify;
  }
}
