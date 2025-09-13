const fs = require('fs');
const path = require('path');
const Module = require('module');
const RESOURCE_PATH = path.join(path.parse(process.execPath).dir, 'resources');

/**
 * 获取resources文件夹下所有的asar文件
 * 将dep开头的作为node_modules，记录其路径
 */
const DEP_PATHS = fs
  .readdirSync(RESOURCE_PATH)
  .filter((item) => item.endsWith('.asar') && item.startsWith('deps'))
  .map((item) => path.join(RESOURCE_PATH, item));

// @ts-ignore
const ORIGIN_MODULE_LOADER = Module._load;

// @ts-ignore
Module._load = function (request, parent, isMain) {
  const module = require.cache[request];
  if (module && module.exports) {
    return module.exports;
  }
  parent.paths = parent.paths.concat(DEP_PATHS);
  const depModule = ORIGIN_MODULE_LOADER.apply(this, [request, parent, isMain]);
  return depModule;
};
