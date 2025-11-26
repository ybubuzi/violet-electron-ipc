/**
 * 窗口控制 IPC 处理模块
 * 提供渲染进程与主进程之间的窗口操作通信接口
 */
import { BrowserWindow, IpcMainInvokeEvent } from 'electron';

/**
 * 获取当前 IPC 事件对应的窗口实例
 * @returns BrowserWindow 实例或 null
 */
function getTargetWindow(): BrowserWindow | null {
  const event = Promise.getContext<IpcMainInvokeEvent>();
  const window = BrowserWindow.fromWebContents(event.sender);
  return window;
}

/**
 * 显示窗口并获取焦点
 * 将窗口置于前台并激活
 */
export function show(): void {
  const window = getTargetWindow();
  if (!window) {
    return;
  }
  window.show();
}

/**
 * 显示窗口但不获取焦点
 * 窗口显示但不会成为活动窗口
 */
export function showInactive(): void {
  const window = getTargetWindow();
  if (!window) {
    return;
  }
  window.showInactive();
}

/**
 * 切换窗口最大化/还原状态
 * 如果窗口已最大化则还原，否则最大化
 */
export function maximize(): void {
  const window = getTargetWindow();
  if (!window) {
    return;
  }

  const isMaximized = window.isMaximized();
  if (isMaximized) {
    window.unmaximize();
  } else {
    window.maximize();
  }
}

/**
 * 最小化窗口
 * 将窗口最小化到任务栏
 */
export function minimize(): void {
  const window = getTargetWindow();
  if (!window) {
    return;
  }
  window.minimize();
}

/**
 * 关闭窗口
 * 关闭当前窗口实例
 */
export function close(): void {
  const window = getTargetWindow();
  if (!window) {
    return;
  }
  window.close();
}
