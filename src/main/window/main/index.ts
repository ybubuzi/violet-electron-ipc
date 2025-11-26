import path from 'path';
import { BrowserWindow, shell } from 'electron';
import { is, optimizer } from '@/main/utils/w_tool';
import { getOutFile } from '@/main/utils/paths';
import icon from '$/resources/icon.png?asset';
import type { BrowserWindowConstructorOptions } from 'electron';

const proloadPath = path.join(getOutFile('preload'));
const renderHtmlPath = path.join(getOutFile('renderer'), 'index.html');

const option = {
  width: 1280,
  height: 920,
  // 禁止修改窗口大小
  resizable: false,
  // 禁止全屏
  fullscreen: false, // is.dev 判定开发环境生产环境来控制全屏
  // 就绪后再显示
  show: false,
  ...(process.platform === 'linux' ? { icon } : {}),
  webPreferences: {
    preload: proloadPath,
    sandbox: false
  }
} satisfies BrowserWindowConstructorOptions;

export function createMain() {
  const window = new BrowserWindow(option);
  // 关闭菜单栏
  window.removeMenu();
  window.on('ready-to-show', () => {
    window.show();
  });

  optimizer.watchWindowShortcuts(window);
  // 窗口中打开窗口时的处理函数，当渲染进程调用window.open触发回调
  window.webContents.setWindowOpenHandler((details) => {
    // 启动外部程序打开窗口
    shell.openExternal(details.url);
    return { action: 'deny' };
  });
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    window.loadFile(renderHtmlPath);
  }
  return window;
}
