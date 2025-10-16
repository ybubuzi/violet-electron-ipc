import { type Plugin } from 'vite';

import type { UserConfig } from 'electron-vite';

const EXTEND_INDEX = '$/config/scripts/deps-loader';
const EXTEND_RE = /scripts(\/|\\)deps-loader/;
export function splitDepLoaderPlugin(): Plugin | null {
  return {
    name: 'split:deps:loader',
    apply: 'build',
    enforce: 'pre',
    async resolveId(id, importer, options) {
      if (id.endsWith('deps-loader')) {
        const resolution = await this.resolve(id, importer, options);
        if (!resolution || resolution.external) return resolution;
        return {
          ...resolution,
          moduleSideEffects: true
        };
      }
    },
    transform(code, id) {
      const moduleInfo = this.getModuleInfo(id);
      if (moduleInfo?.isEntry) {
        return {
          code: `import '${EXTEND_INDEX}';\n${code}`
        };
      }
    },
    load(id) {
      if (EXTEND_RE.test(id)) {
        this.emitFile({
          type: 'chunk',
          id: id,
          name: 'deps-loader'
        });
      }
    }
  };
}

function injectPlugin(config: any, propties: string) {
  const plugins = config[propties]?.plugins ?? [];
  const plugin = splitDepLoaderPlugin();

  if (plugins.length === 0) {
    // @ts-ignore
    config[propties].plugins = [plugin];
    return;
  } else {
    plugins.push(plugin);
  }

  // @ts-ignore
  config[propties].plugins = plugins;
}
export function useSplitDepLoaderPlugin(config: UserConfig) {
  // 非生产环境禁用插件
  if (process.env.NODE_ENV_ELECTRON_VITE !== 'production') {
    return null;
  }
  injectPlugin(config, 'main');
  injectPlugin(config, 'preload');
}
export default useSplitDepLoaderPlugin;
