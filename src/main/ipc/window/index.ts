import { BrowserWindow, IpcMainInvokeEvent } from 'electron';
import { getStore } from '../ctx';

export function maximize() {
  const event = getStore<IpcMainInvokeEvent>();
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window) {
    window.maximize();
  }
}
