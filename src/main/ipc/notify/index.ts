import { IpcMainInvokeEvent } from 'electron';
import { addTargetNotify, removeTargetNotify } from '@/main/notify';

/**
 * 建立通知回调链接
 * @param event
 * @param invoke
 */
export function link(event: string, invoke: IpcMainInvokeEvent) {
  addTargetNotify(event, invoke);
}

/**
 * 删除通知回调链接
 * @param event
 * @param invoke
 */
export function unlink(event: string, invoke: IpcMainInvokeEvent) {
  removeTargetNotify(event, invoke);
}
