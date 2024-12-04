import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import vue from '@vitejs/plugin-vue';
import { useAliasPathPlugin } from './config/vite-plugin/alias.vite.config';
import useControllerPlugin from './config/vite-plugin/controller-scan.vite.config';
import type { UserConfig } from 'electron-vite';

export default defineConfig((_cfg) => {
  const config: UserConfig = {
    main: {
      plugins: [
        externalizeDepsPlugin({
          exclude: ['nanoid']
        })
      ]
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
  useControllerPlugin(config);
  return config;
});
