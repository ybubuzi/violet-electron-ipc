import { IpcMainInvokeEvent } from 'electron';
import { addTargetNotify, removeTargetNotify } from '@/main/notify';
import { getStore } from '../ctx';
import * as IPC from '@/main/notify/types';
/**
 * 建立通知回调链接
 * @param event
 * @param invoke
 */
export function link<T extends IPC.NotifyEvent>(event: T) {
  const invoke = getStore<IpcMainInvokeEvent>();
  addTargetNotify(event, invoke);
}

/**
 * 删除通知回调链接
 * @param event
 * @param invoke
 */
export function unlink<T extends IPC.NotifyEvent>(event: T) {
  const invoke = getStore<IpcMainInvokeEvent>();
  removeTargetNotify(event, invoke);
}
