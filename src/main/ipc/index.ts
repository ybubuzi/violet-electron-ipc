import * as Handles from './handles';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { run } from './ctx';

export function useIpcHandle() {
  const serviceNameList = Object.keys(Handles);
  for (const serviceName of serviceNameList) {
    const service = Handles[serviceName];
    if (typeof service !== 'object') {
      continue;
    }
    const callbackNameList = Object.keys(service);
    for (const callbackName of callbackNameList) {
      const handle = `${serviceName}-${callbackName}`;
      const callback = service[callbackName];
      if (typeof callback !== 'function') {
        continue;
      }
      ipcMain.handle(handle, (event: IpcMainInvokeEvent, ...args: any[]) => {
        return run(event, () => {
          return Promise.resolve(callback(...args, event));
        });
      });
      console.log(`handle: [${handle}] 注册了\n`);
    }
  }
}

export default useIpcHandle;
