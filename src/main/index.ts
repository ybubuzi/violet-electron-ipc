import '@/main/extend';
import { app, BrowserWindow } from 'electron';
import { electronApp } from '@electron-toolkit/utils';
import { useIpcHandle } from '@/main/ipc';
import { createMain } from '@/main/window/main';
import * as pkg from '$/package.json';

async function main(_args?: string[]) {
  // @ts-ignore
  const USER_IDENTIFY = pkg.userIdentify ?? 'com.bubuzi.snapshot';

  await app.whenReady();
  // 启动ipc注册
  useIpcHandle();
  // 应用用户模型 ID
  electronApp.setAppUserModelId(USER_IDENTIFY);
  // 获取应用单例锁,禁用应用多次调用
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  }
  app.on('activate', function () {
    // 激活窗口时若不存在窗口则创建，适用于托盘启动窗口
    if (BrowserWindow.getAllWindows().length === 0) createMain();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
  createMain();
}
main();
