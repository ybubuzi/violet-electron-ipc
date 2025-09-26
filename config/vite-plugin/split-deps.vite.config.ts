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
export function useSplitDepLoaderPlugin(config: UserConfig) {
  const plugins = config.main?.plugins ?? [];
  const plugin = splitDepLoaderPlugin();

  if (plugins.length === 0) {
    // @ts-ignore
    config.main.plugins = [plugin];
    return;
  } else {
    plugins.push(plugin);
  }

  // @ts-ignore
  config.main.plugins = plugins;
}
export default useSplitDepLoaderPlugin;
