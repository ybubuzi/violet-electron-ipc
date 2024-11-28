import { ElectronAPI } from '@electron-toolkit/preload';

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

import type { NotifyTypeMap } from '@/main/notify';

interface Notify {
  addListener<T extends keyof NotifyTypeMap>(event: T, callback: (...params: DestructionTuple<NotifyTypeMap[T]>) => void);
  removeListener<T extends keyof NotifyTypeMap>(event: T, callback: (...params: DestructionTuple<NotifyTypeMap[T]>) => void);
  removeAllListeners<T extends keyof NotifyTypeMap>(event: T);
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: HandleApi;
    notify: Notify;
  }
}
