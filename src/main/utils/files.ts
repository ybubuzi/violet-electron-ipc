import { stat as _stat } from "fs/promises";
import { PathLike, Stats } from "fs";

/**
 * 文件系统工具模块
 * 导出常用的文件操作函数，提供统一的文件系统访问接口
 */

/**
 * 导出文件系统基础操作函数
 * - open: 打开文件
 * - mkdir: 创建目录
 * - readFile: 读取文件内容
 * - writeFile: 写入文件内容
 */
export { open, mkdir, readFile, writeFile } from "fs/promises";

/**
 * 获取文件或目录状态信息 - 安全版本的 fs.stat，不会抛出异常
 * @param targetPath - 目标文件或目录的路径
 * @returns 返回文件状态信息对象，如果文件不存在或发生错误则返回 null
 *
 * @example
 * ```typescript
 * const fileStats = await stat('./example.txt');
 * if (fileStats) {
 *   console.log('文件大小:', fileStats.size);
 *   console.log('是否为文件:', fileStats.isFile());
 *   console.log('是否为目录:', fileStats.isDirectory());
 * } else {
 *   console.log('文件不存在或无法访问');
 * }
 * ```
 */
export async function stat(targetPath: PathLike): Promise<Stats | null> {
  try {
    const fileStatistics = await _stat(targetPath);
    return fileStatistics;
  } catch {
    // 文件不存在或无权限访问时返回 null，而不是抛出异常
    return null;
  }
}
