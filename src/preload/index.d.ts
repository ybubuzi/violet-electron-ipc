import { ElectronAPI } from '@electron-toolkit/preload';
import type * as IPC from '@/main/notify/types';

type HandleLike = typeof import('@/main/ipc/handles');
type HandleLikeServices = keyof HandleLike;
type HandleLikeServiceFunction<T extends HandleLikeServices> = keyof HandleLike[T];
type HandleApi = {
  [ServiceName in HandleLikeServices]: {
    [ServiceFunctionName in HandleLikeServiceFunction<ServiceName>]: (
      ...agrs: Exclude<Parameters<HandleLike[ServiceName][ServiceFunctionName]>, import('electron').IpcMainInvokeEvent>
    ) => Promise<ReturnType<HandleLike[ServiceName][ServiceFunctionName]>>;
  };
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
