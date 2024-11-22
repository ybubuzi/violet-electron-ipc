import { WebContents, IpcMainInvokeEvent } from 'electron';

const NOTIFY_TARGET_MAPPER = new Map<string, Set<WebContents>>();

/**
 * 添加一个通知目标至队列
 * @param event
 * @param invokeEvent
 */
export function addTargetNotify(event: string, invokeEvent: IpcMainInvokeEvent) {
  if (!invokeEvent.sender) {
    throw new Error('addTargetNotify');
  }
  let contentSet = NOTIFY_TARGET_MAPPER.get(event);
  if (!contentSet) {
    contentSet = new Set();
    NOTIFY_TARGET_MAPPER.set(event, contentSet);
  }
  contentSet.add(invokeEvent.sender);
}

/**
 * 移除通知目标
 * @param event 
 * @param invokeEvent 
 */
export function removeTargetNotify(event: string, invokeEvent: IpcMainInvokeEvent) {
  if (!invokeEvent.sender) {
    throw new Error('removeTargetNotify');
  }
  const contentSet = NOTIFY_TARGET_MAPPER.get(event);
  if (contentSet) {
    contentSet.delete(invokeEvent.sender);
  }
}

/**
 * 向渲染进程发送通知
 * @param event 
 * @param args 
 * @returns 
 */
export function sendToWebContent(event: string, ...args: any[]) {
  const contentSet = NOTIFY_TARGET_MAPPER.get(event);
  if (!contentSet) {
    return;
  }
  for (const web of contentSet) {
    web.send(event, ...args);
  }
}
