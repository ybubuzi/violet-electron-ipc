import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import { useAliasPathPlugin } from './config/vite-plugin/alias.vite.config';
import { useSplitDepLoaderPlugin } from './config/vite-plugin/split-deps.vite.config';
import { bytecodePlugin } from './config/vite-plugin/overload.bytecodePlugin.vite.config';
import type { UserConfig } from 'electron-vite';

export default defineConfig((_cfg) => {
  const config: UserConfig = {
    main: {
      plugins: [
        externalizeDepsPlugin({
          exclude: ['nanoid']
        }),
        bytecodePlugin({
          exclude: (id) => {
            console.log(id);
            if (id.includes('src/main/exclude_custom')) {
              return true;
            }
            return false;
          }
        })
      ],
      build: {
        rollupOptions: {
          treeshake: {
            /**
             *
             * 该函数决定在源码编译过程中是否忽略该模块的代码
             * 部分代码引入后没有使用，默认情况将会被编译抛弃不再进入输出代码中
             * @param id 传入脚本的路径
             * @returns
             */
            moduleSideEffects: (id: string) => {
              return /main(\\|\/)extend/.test(id);
            }
          }
        }
      }
    },

    preload: {
      plugins: [externalizeDepsPlugin()]
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src')
        }
      },
      plugins: [vue()]
    }
  };
  useAliasPathPlugin(config);
  useSplitDepLoaderPlugin(config);
  return config;
});
