import { app } from 'electron';
import { is } from '@/main/utils/w_tool';
import { parse, join } from 'path';
import * as pkg from '$/package.json';
import { fileURLToPath } from 'url';
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

/**
 * 获取程序文档路径
 * @returns
 */
export const getDocumentPath = (): string => {
  return join(app.getPath('documents'), pkg.author, pkg.name);
};

/**
 * 获取资源文件路径
 * @returns
 */
export const getResourcePath = (): string => {
  const root = getExePath();
  return join(root, 'resources');
};

/**
 * 获取最终编译输出文件的目录
 * 确保开发环境与生产环境的统一
 * @param name
 * @returns
 */
export const getOutFile = (name: 'main' | 'renderer' | 'preload'): string => {
  return fileURLToPath(new URL(`../${name}`, import.meta.url).href);
};
