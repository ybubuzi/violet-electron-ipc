import { type Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

import type { UserConfig } from 'electron-vite';

const splitDepLoaderCode = [
  `const fs = require('fs');`,
  `const path = require('path');`,
  `const Module = require('module');`,
  `const RESOURCE_PATH = path.join(path.parse(process.execPath).dir, 'resources');`,
  `const DEP_PATHS = fs`,
  `  .readdirSync(RESOURCE_PATH)`,
  `  .filter((item) => item.endsWith('.asar') && item.startsWith('deps'))`,
  `  .map((item) => path.join(RESOURCE_PATH, item));`,
  `const ORIGIN_MODULE_LOADER = Module._load;`,
  `Module._load = function (request, parent, isMain) {`,
  `  const module = require.cache[request];`,
  `  if (module && module.exports) {`,
  `    return module.exports;`,
  `  }`,
  `  parent.paths = parent.paths.concat(DEP_PATHS);`,
  `  const depModule = ORIGIN_MODULE_LOADER.apply(this, [request, parent, isMain]);`,
  `  return depModule;`,
  `};`
];
const isDev = process.env.NODE_ENV_ELECTRON_VITE === 'development';
const loaderFileName = 'split-deps-loader.cjs';
function splitDepLoaderPlugin(): Plugin | null {
  return {
    name: 'split:deps:loader',
    apply: 'build',
    enforce: 'pre',
    generateBundle: function (options) {
      if (options.format !== 'es') {
        this.emitFile({
          type: 'asset',
          source: splitDepLoaderCode.join('\n') + '\n',
          name: 'Split Dependencys Loader',
          fileName: loaderFileName
        });
      }
    },
    writeBundle: async function (options, output) {
      if (isDev) {
        return;
      }
      if (options.format === 'es') {
        return;
      }
      // 输出文件路径
      const outDir = options.dir!;
      // 将要输出的脚本文件
      const bundles = Object.keys(output);

      await Promise.all(
        bundles.map(async (name) => {
          const chunk = output[name];
          if (chunk.type !== 'chunk') {
            return;
          }
          /** @type {string} */
          let _code = chunk.code;
          const fristLine = `"use strict";`;
          const idx = _code.indexOf(fristLine);
          let offset = 0;
          if (idx > -1) {
            offset = _code.indexOf('\n', idx + fristLine.length) + 1;
          }
          const chunkFileName = path.resolve(outDir, name);
          const content = _code.slice(offset);
          const code = `${fristLine};\nrequire("./${loaderFileName}");\n${content}`;
          fs.unlinkSync(chunkFileName);
          fs.writeFileSync(chunkFileName, code);
        })
      );
    }
  };
}
export function useSplitDepLoaderPlugin(config: UserConfig) {
  const plugins = config.main?.plugins ?? [];
  const plugin = splitDepLoaderPlugin();
  if (plugins.length === 0) {
    config.main.plugins = [plugin];
    return;
  }
  const idx = plugins.findIndex((curr) => {
    // @ts-ignore
    return curr.name === 'vite:bytecode';
  });
  if (idx >= 0) {
    plugins.splice(idx, 0, plugin);
  } else {
    plugins.push(plugin);
  }

  config.main.plugins = plugins;
}
