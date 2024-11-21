import { BrowserWindow } from 'electron'

export function maximize() {
  const window = BrowserWindow.getFocusedWindow()
  if (window) {
    window.maximize()
  }
}
