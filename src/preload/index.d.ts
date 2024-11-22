import { ElectronAPI } from '@electron-toolkit/preload';

type HandleLike = typeof import('../main/ipc/handles');
type HandleLikeServices = keyof HandleLike;
type HandleLikeServiceFunction<T extends HandleLikeServices> = keyof HandleLike[T];
type HandleApi = {
  [ServiceName in HandleLikeServices]: {
    [ServiceFunctionName in HandleLikeServiceFunction<ServiceName>]: (
      ...agrs: Exclude<Parameters<HandleLike[ServiceName][ServiceFunctionName]>, import('electron').IpcMainInvokeEvent>
    ) => Promise<ReturnType<HandleLike[ServiceName][ServiceFunctionName]>>;
  };
};

declare global {
  interface Window {
    electron: ElectronAPI;
    api: HandleApi;
  }
}
