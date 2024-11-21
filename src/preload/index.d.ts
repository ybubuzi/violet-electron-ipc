import { ElectronAPI } from '@electron-toolkit/preload'

type HandleLike = typeof import('../main/ipc/handles')
type D = keyof HandleLike
type C<T extends D> = keyof HandleLike[T]
type E = {
  [key1 in D]: {
    [key in C<key1>]: (
      ...agrs: Exclude<Parameters<HandleLike[key1][key]>, import('electron').IpcMainInvokeEvent>
    ) => Promise<ReturnType<HandleLike[key1][key]>>
  }
}
const d: E = {}

declare global {
  interface Window {
    electron: ElectronAPI
    api: E
  }
}
