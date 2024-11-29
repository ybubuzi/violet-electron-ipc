import { WebContents, IpcMainInvokeEvent } from 'electron';

const NOTIFY_TARGET_MAPPER = new Map<string, Set<WebContents>>();

/**
 * 添加一个通知目标至队列
 * @param event
 * @param invokeEvent
 */
export function addTargetNotify<T extends IPC.NotifyEvent>(event: T, invokeEvent: IpcMainInvokeEvent) {
  if (!invokeEvent.sender) {
    throw new Error('The sender is null');
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
export function removeTargetNotify<T extends IPC.NotifyEvent>(event: T, invokeEvent: IpcMainInvokeEvent) {
  if (!invokeEvent.sender) {
    throw new Error('The sender is null');
  }
  const contentSet = NOTIFY_TARGET_MAPPER.get(event);
  if (contentSet) {
    contentSet.delete(invokeEvent.sender);
  }
}

export type NotifyTypeMap = {
  hello: [string, number];
  login: { username: string; password: string };
  say: string;
};

/**
 * 向渲染进程发送通知
 * @param event
 * @param args
 * @returns
 */
export function sendToWebContent<T extends IPC.NotifyEvent>(event: T, ...params: IPC.RemnantParams<T>) {
  const contentSet = NOTIFY_TARGET_MAPPER.get(event);
  if (!contentSet) {
    return;
  }
  for (const web of contentSet) {
    web.send(event, ...params);
  }
}
