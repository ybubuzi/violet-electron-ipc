import * as Handles from './handles';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { run } from './ctx';

function ipcResultWrap(handle: string, result?: unknown, error?: unknown) {
  const pack = {
    handle,
    status: !!error ? 'error' : 'success',
    data: result,
    error: {
      handle,
      message: undefined
    }
  };
  if (error) {
    if (error instanceof Error) {
      pack.error.message = error.message;
    } else if (error instanceof Object) {
      pack.error.message = JSON.stringify(error);
    } else {
      pack.error.message = String(error);
    }
  }

  return pack;
}

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
        return run(event, async () => {
          let result: unknown;
          let error: unknown;
          try {
            result = await member(...args);
          } catch (_error) {
            error = _error;
          }
          return ipcResultWrap(handle, result, error);
        });
      });
      logger.info(`handle: [{0}] 注册了`.format(handle));
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
