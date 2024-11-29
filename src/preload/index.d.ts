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

interface Notify {
  addListener<T extends IPC.NotifyEvent>(event: T, callback: (...params: DestructionTuple<IPC.NotifyTypeMap[T]>) => void);
  removeListener<T extends IPC.NotifyEvent>(event: T, callback: (...params: DestructionTuple<IPC.NotifyTypeMap[T]>) => void);
  removeAllListeners<T extends IPC.NotifyEvent>(event: T);
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: HandleApi;
    notify: Notify;
  }
}
