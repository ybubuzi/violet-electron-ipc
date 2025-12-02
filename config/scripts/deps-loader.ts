import fs from 'fs';
import path from 'path';
import Module from 'module';

// 判断当前加载环境是否是由用户编写的代码环境，通过路径判断
const IS_USER_CTX = /[\/\\]resources[\/\\]app(?:\.asar)?[\/\\]out[\/\\]main/i;

const RESOURCE_PATH = path.join(path.parse(process.execPath).dir, 'resources');
const DEP_PATHS = fs
  .readdirSync(RESOURCE_PATH)
  .filter((item) => item.endsWith('.asar') && item.startsWith('deps'))
  .map((item) => path.join(RESOURCE_PATH, item));
// @ts-ignore 存储默认的库路径解析函数
const originalResolve = Module._resolveFilename;
// @ts-ignore 重写库路径加载
Module._resolveFilename = function (request, parent, isMain, options) {
  if (parent && Array.isArray(parent.paths)) {
    for (const depPath of DEP_PATHS) {
      const nodeModulesPath = path.join(depPath);
      if (!parent.paths.includes(nodeModulesPath)) {
        parent.paths.unshift(nodeModulesPath); // unshift 比 push 优先级更高
      }
    }
  }
  // parentId代表当前请求是从哪个文件发出
  const parentId = parent?.id;
  if (parentId && IS_USER_CTX.test(parentId) && request.startsWith('./') && request.endsWith('.js')) {
    // 发出文件是jsc格式时替换
    if (parentId.endsWith('.jsc')) {
      request = request + 'c';
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
