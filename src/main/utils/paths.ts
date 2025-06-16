import { app } from 'electron';
import { is } from '@electron-toolkit/utils';
import { parse } from 'path';

/**
 * 获取exe文件所在目录
 * @returns 执行文件所在路径
 */
export const getExePath = (): string => {
  return is.dev ? app.getAppPath() : parse(app.getPath('exe')).dir;
};

/**
 * 获取用户数据路径
 * @returns
 */
export const getUserDataPath = (): string => {
  return is.dev ? getExePath() : app.getPath('userData');
};
