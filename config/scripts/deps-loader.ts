import fs from 'fs';
import path from 'path';
import Module from 'module';

const RESOURCE_PATH = path.join(path.parse(process.execPath).dir, 'resources');
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
  for (const DEP_PATH of DEP_PATHS) {
    if (!parent.paths.includes(DEP_PATH)) {
      parent.paths.push(DEP_PATH);
    }
  }
  const depModule = ORIGIN_MODULE_LOADER.apply(this, [request, parent, isMain]);
  return depModule;
};
