import { defineConfig } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import { useAliasPathPlugin } from "./config/vite-plugin/alias.vite.config";
import { useSplitDepLoaderPlugin } from "./config/vite-plugin/split-deps.vite.config";
import UnpluginInfo from "unplugin-info/vite";
import VueDevTools from "vite-plugin-vue-devtools";
import type { UserConfig } from "electron-vite";

export default defineConfig(() => {
  const config: UserConfig = {
    main: {
      plugins: [UnpluginInfo()],
      build: {
        bytecode: true,
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
            },
          },
        },
      },
    },

    preload: {
      build: {
        externalizeDeps: true,
      },
    },
    renderer: {
      plugins: [vue(), VueDevTools()],
    },
  };
  useAliasPathPlugin(config);
  useSplitDepLoaderPlugin(config);
  return config;
});
