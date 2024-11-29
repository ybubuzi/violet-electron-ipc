import * as Handles from './handles';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { run } from './ctx';

/**
 * 深度代理ipc，支持深层ipc嵌套
 * @param module
 * @param prefix
 */
function deepIpcHandle(module: Object, prefix: string = '') {
  const memberList = Object.keys(module);
  for (const memberName of memberList) {
    const handle = '' === prefix ? memberName : `${prefix}-${memberName}`;
    const member = module[memberName];
    if (typeof member === 'function') {
      ipcMain.handle(handle, (event: IpcMainInvokeEvent, ...args: any[]) => {
        return run(event, () => {
          return Promise.resolve(member(...args, event));
        });
      });
      console.log(`handle: [${handle}] 注册了\n`);
    }
    if (typeof member === 'object') {
      deepIpcHandle(member, handle);
    }
  }
}

export function useIpcHandle() {
  const serviceNameList = Object.keys(Handles);
  for (const serviceName of serviceNameList) {
    const service = Handles[serviceName];
    if (typeof service !== 'object') {
      continue;
    }
    deepIpcHandle(service, serviceName);
  }
}

export default useIpcHandle;
