import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import tseslint from "@electron-toolkit/eslint-config-ts";
import js from "@eslint/js";
import globals from "globals";

export default tseslint.config(
  // 全局忽略
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "out/**",
      "build/**",
      "**/*.d.ts",
      "packages/**/dist/**",
    ],
  },

  // ============================================
  // 基础配置（所有文件）
  // ============================================
  js.configs.recommended,
  tseslint.configs.recommended,

  // ============================================
  // Main 进程 + Preload（Node 环境）
  // ============================================
  {
    files: ["src/main/**/*.ts", "src/preload/**/*.ts", "src/shared/**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      // Node 环境特定规则
      "no-console": "off",
      // 允许函数不声明详细的函数返回值类型
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // ============================================
  // Renderer 进程（Vue + Browser 环境）
  // ============================================
  ...pluginVue.configs["flat/recommended"],

  {
    files: ["src/renderer/**/*.ts", "src/renderer/**/*.vue"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // Vue 文件解析器配置
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        sourceType: "module",
      },
    },
  },

  // Vue 自定义规则
  {
    files: ["src/renderer/**/*.vue"],
    rules: {
      "vue/require-default-prop": "off",
      "vue/multi-word-component-names": "off",
    },
  },

  // ============================================
  // 配置文件（Node 环境）
  // ============================================
  {
    files: ["*.config.{js,mjs,ts}", "config/**/*.{js,mjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // CJS 文件允许 require，放宽 TS 规则
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },

  // JS/MJS 脚本文件放宽 TS 规则
  {
    files: ["config/**/*.{js,mjs}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
);
