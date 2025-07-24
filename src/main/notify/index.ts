import { WebContents, IpcMainInvokeEvent } from 'electron';
import * as IPC from '@/main/notify/types';

// #region 全局变量
/**
 * @description 记录通知事件所对应的多个`渲染进程`
 * @summary `主进程`调用后将发送指定某个或全部`渲染进程`
 */
const NOTIFY_TARGET_MAPPER = new Map<string, Set<WebContents>>();

/**
 * @description 记录渲染进程所对应的多个通知事件
 * @summary 一个渲染进程可能会挂载多个通知，当渲染进程退出时应当主动释放对应的资源
 */
const NOTIFY_SENDER_STATUS_MAPPER = new Map<WebContents, Set<string>>();

/**
 * @description 等待队列，用于暂存未就绪的渲染进程的通知注册请求
 * @summary 当 `addTargetNotify` 被调用但渲染进程尚未就绪时，请求将进入此队列
 * @summary 渲染进程就绪后，将遍历此队列，完成所有挂起的注册
 */
const NOTIFY_WAIT_QUEUE = new Map<WebContents, Set<string>>();

/**
 * @description 标记一个渲染进程的生命周期事件是否已经被监听
 * @summary 防止对同一个 WebContents 重复绑定 'destroyed' 和 'did-finish-load' 事件
 */
const LIFECYCLE_HANDLER_FLAG_MAPPER = new Map<WebContents, boolean>();
// #endregion

// #region 内部核心函数
/**
 * @description 清理指定渲染进程所有已注册的通知事件
 * @param webContent 目标渲染进程的 WebContents
 */
function clearSenderRegistrations(webContent: WebContents) {
  const registeredEvents = NOTIFY_SENDER_STATUS_MAPPER.get(webContent);
  if (registeredEvents) {
    registeredEvents.forEach((event) => {
      const webContentsSet = NOTIFY_TARGET_MAPPER.get(event);
      if (webContentsSet) {
        webContentsSet.delete(webContent);
        if (webContentsSet.size === 0) {
          NOTIFY_TARGET_MAPPER.delete(event);
        }
      }
    });
  }
  NOTIFY_SENDER_STATUS_MAPPER.delete(webContent);
}

/**
 * @description 为渲染进程设置生命周期事件监听，实现自动化的资源清理
 * @summary 此函数确保每个渲染进程只被设置一次监听
 * @param webContent 目标渲染进程的 WebContents
 */
function setupWebContentLifecycleHandlers(webContent: WebContents) {
  if (LIFECYCLE_HANDLER_FLAG_MAPPER.get(webContent)) {
    return;
  }

  // 当窗口关闭或 webContent 被销毁时触发
  const destroyHandler = () => {
    logger.info(`[Notify] WebContents (ID: {0}) destroyed. Cleaning up.`.format(webContent.id));
    clearSenderRegistrations(webContent); // 清理通知注册
    NOTIFY_WAIT_QUEUE.delete(webContent);
    LIFECYCLE_HANDLER_FLAG_MAPPER.delete(webContent);

    webContent.removeListener('destroyed', destroyHandler);
  };

  webContent.on('destroyed', destroyHandler);

  // 设置标志位，表示该 webContent 的生命周期事件已在监听
  LIFECYCLE_HANDLER_FLAG_MAPPER.set(webContent, true);
}

/**
 * @description 实际执行添加通知的内部函数
 * @param event 事件名称
 * @param webContent 渲染进程
 */
function doAddTargetNotify(event: string, webContent: WebContents) {
  if (!NOTIFY_TARGET_MAPPER.has(event)) {
    NOTIFY_TARGET_MAPPER.set(event, new Set());
  }
  NOTIFY_TARGET_MAPPER.get(event)!.add(webContent);

  if (!NOTIFY_SENDER_STATUS_MAPPER.has(webContent)) {
    NOTIFY_SENDER_STATUS_MAPPER.set(webContent, new Set());
  }
  NOTIFY_SENDER_STATUS_MAPPER.get(webContent)!.add(event);

  // 确保生命周期处理器已设置
  setupWebContentLifecycleHandlers(webContent);
}
// #endregion

// #region 导出的公开API
/**
 * @description [供渲染进程调用] 渲染进程通知主进程它已准备好接收通知
 * @summary 调用此函数后，将处理等待队列中的所有挂起请求
 * @param invokeEvent IPC调用事件对象
 */
export function rendererReadyForNotifications(webContent: WebContents) {
  logger.info(`[Notify] WebContents (ID: {0}) is ready for notifications.`.format(webContent.id));

  const waitingEvents = NOTIFY_WAIT_QUEUE.get(webContent);
  if (waitingEvents && waitingEvents.size > 0) {
    logger.info(`[Notify] Processing wait queue for WebContents (ID: {0}). Events:`.format(webContent.id), waitingEvents);
    waitingEvents.forEach((event) => {
      // 对每个在等待队列里的事件，执行真正的注册逻辑
      doAddTargetNotify(event, webContent);
    });
    // 处理完毕后，清空该渲染进程的等待队列
    NOTIFY_WAIT_QUEUE.delete(webContent);
  }
}

/**
 * @description [供主进程其他模块调用] 添加一个通知目标至队列
 * @param event 事件名称
 * @param webContent 目标渲染进程
 */
export function addTargetNotify<T extends IPC.NotifyEvent>(event: T, invokeEvent: IpcMainInvokeEvent) {
  const webContent = invokeEvent.sender;
  if (!webContent || webContent.isDestroyed()) {
    console.error('[Notify] Attempted to add notify target to a destroyed or null WebContents.');
    return;
  }

  // 如果已就绪，直接执行注册
  logger.info(`[Notify] Adding target for event '{0}' to WebContents (ID: {1}).`.format(event, webContent.id));
  doAddTargetNotify(event, webContent);
}

/**
 * @description [供主进程其他模块调用] 移除通知目标
 * @param event 事件名称
 * @param webContent 目标渲染进程
 */
export function removeTargetNotify<T extends IPC.NotifyEvent>(event: T, invokeEvent: IpcMainInvokeEvent) {
  const webContent = invokeEvent.sender;
  if (!webContent || webContent.isDestroyed()) {
    console.error('[Notify] Attempted to remove notify target from a destroyed or null WebContents.');
    return;
  }
  const contentSet = NOTIFY_TARGET_MAPPER.get(event);
  if (contentSet) {
    contentSet.delete(webContent);
    if (contentSet.size === 0) {
      NOTIFY_TARGET_MAPPER.delete(event);
    }
  }

  const eventSet = NOTIFY_SENDER_STATUS_MAPPER.get(webContent);
  if (eventSet) {
    eventSet.delete(event);
    if (eventSet.size === 0) {
      NOTIFY_SENDER_STATUS_MAPPER.delete(webContent);
    }
  }
  logger.info(`[Notify] Removed target for event '{0}' from WebContents (ID: {1}).`.format(event, webContent.id));
}

/**
 * @description [供主进程其他模块调用] 向所有监听了该事件的渲染进程发送通知
 * @param event 事件名称
 * @param params 传递给渲染进程的参数
 */
export function sendToWebContent<T extends IPC.NotifyEvent>(event: T, ...params: IPC.RemnantParams<T>) {
  const contentSet = NOTIFY_TARGET_MAPPER.get(event);
  if (!contentSet || contentSet.size === 0) {
    console.warn(`[Notify] No webContents registered for event: {0}`.format(event));
    return;
  }

  for (const web of contentSet) {
    if (web && !web.isDestroyed()) {
      web.send(event, ...params);
    }
  }
}
// #endregion
