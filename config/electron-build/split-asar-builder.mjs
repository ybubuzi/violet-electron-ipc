// 导入 electron-builder 相关模块
import { Packager, Platform } from 'electron-builder/node_modules/app-builder-lib/out/index.js';
import { AppInfo } from 'electron-builder/node_modules/app-builder-lib/out/appInfo.js';
import { getNodeModuleFileMatcher } from 'electron-builder/node_modules/app-builder-lib/out/fileMatcher.js';
import {
  computeNodeModuleFileSets,
  copyAppFiles
} from 'electron-builder/node_modules/app-builder-lib/out/util/appFileCopier.js';
import { LibUiFramework } from 'electron-builder/node_modules/app-builder-lib/out/frameworks/LibUiFramework.js';
import { ProtonFramework } from 'electron-builder/node_modules/app-builder-lib/out/ProtonFramework.js';
import { createElectronFrameworkSupport } from 'electron-builder/node_modules/app-builder-lib/out/electron/ElectronFramework.js';
import { createTransformer, isElectronCompileUsed } from 'electron-builder/node_modules/app-builder-lib/out/fileTransformer.js';
import { getConfig } from 'electron-builder/node_modules/app-builder-lib/out/util/config/config.js';
import { Lazy } from 'lazy-val';
import { readPackageJson } from 'electron-builder/node_modules/app-builder-lib/out/util/packageMetadata.js';

// 导入 Node.js 内置模块和第三方模块
import path from 'path';
import { normalizeOptions } from 'electron-builder/out/builder.js';
import asar from '@electron/asar';
import fs from 'fs';
import os from 'os';
/**
 * 根据配置创建框架信息
 * @param {Object} configuration - 构建配置对象
 * @param {Packager} packager - 打包器实例
 * @returns {Promise<Object>} 框架支持对象
 */
async function createFrameworkInfo(configuration, packager) {
  // 获取框架类型并转换为小写
  let frameworkName = configuration.framework;
  if (frameworkName != null) {
    frameworkName = frameworkName.toLowerCase();
  }

  // 获取 Node.js 版本配置
  let nodeVersion = configuration.nodeVersion;
  
  // 如果是 Electron 框架或未指定框架
  if (frameworkName === 'electron' || frameworkName == null) {
    return await createElectronFrameworkSupport(configuration, packager);
  }

  // 设置默认 Node.js 版本为当前版本
  if (nodeVersion == null || nodeVersion === 'current') {
    nodeVersion = process.versions.node;
  }

  // 构建 macOS 应用名称
  const macOSAppName = `${packager.appInfo.productFilename}.app`;
  const isLaunchUiEnabled = configuration.launchUiVersion !== false;
  
  // 根据框架类型创建对应的框架实例
  if (frameworkName === 'proton' || frameworkName === 'proton-native') {
    return new ProtonFramework(nodeVersion, macOSAppName, isLaunchUiEnabled);
  } else if (frameworkName === 'libui') {
    return new LibUiFramework(nodeVersion, macOSAppName, isLaunchUiEnabled);
  } else {
    throw new Error(`未知的框架类型: ${frameworkName}`);
  }
}
// Electron 编译时的垫片文件名
const ELECTRON_COMPILE_SHIM_FILENAME = '__shim.js';

/**
 * 分离依赖文件到指定目录
 * @param {Packager} packager - 打包器实例
 * @param {string} outputDirectory - 输出目录
 */
async function splitDeps(packager, outputDirectory) {
  // 验证配置
  await packager.validateConfig();
  
  // 初始化应用信息和框架
  packager._appInfo = new AppInfo(packager, null);
  packager._framework = await createFrameworkInfo(packager.config, packager);
  
  // 检查是否使用 Electron 编译
  const isElectronCompileEnabled = isElectronCompileUsed(packager);
  const framework = packager.framework;
  const config = packager.config;
  
  // 创建文件转换器
  const transformer = createTransformer(
    packager.appDir,
    packager.config,
    isElectronCompileEnabled
      ? {
          originalMain: packager.info.metadata.main,
          main: ELECTRON_COMPILE_SHIM_FILENAME,
          ...config.extraMetadata
        }
      : config.extraMetadata,
    framework.createTransformer == null ? null : framework.createTransformer()
  );
  
  // 遍历所有目标平台
  for (const [platform] of packager.options.targets) {
    // 检查跨平台构建限制
    if (platform === Platform.MAC && process.platform === Platform.WINDOWS.nodeName) {
      throw new Error('macOS 构建仅在 macOS 系统上支持，请查看 https://electron.build/multi-platform-build');
    }
    
    // 创建平台打包器
    const platformPackager = await packager.createHelper(platform);
    const platformSpecificBuildOptions = platformPackager.platformSpecificBuildOptions;
    
    // 创建模块文件匹配器
    const moduleFileMatcher = getNodeModuleFileMatcher(
      packager.appDir,
      outputDirectory,
      (s) => s,
      platformSpecificBuildOptions,
      packager
    );

    // 计算需要包含的 Node.js 模块文件集合
    const moduleFileSets = await computeNodeModuleFileSets(platformPackager, moduleFileMatcher);

    // 复制应用文件（仅处理包含文件的集合）
    for (const fileSet of moduleFileSets.filter((set) => set.files.length > 0)) {
      await copyAppFiles(fileSet, packager, transformer);
    }
  }
}

/**
 * 获取原始构建配置
 * @param {string} projectDirectory - 项目目录
 * @param {string} configFilePath - 配置文件路径
 * @returns {Promise<Object>} 构建配置对象
 */
async function getRawConfig(projectDirectory, configFilePath = 'electron-builder.yml') {
  // 读取开发环境的 package.json
  const devPackageFilePath = path.join(projectDirectory, 'package.json');
  const devMetadata = await readPackageJson(devPackageFilePath);

  // 获取构建配置
  const configuration = await getConfig(
    projectDirectory, 
    configFilePath, 
    null, 
    new Lazy(() => Promise.resolve(devMetadata))
  );
  
  return configuration;
}

/**
 * 从配置中提取所有平台的目标配置
 * @param {Object} processedConfig - 处理后的配置对象
 * @returns {Array<Object>} 平台目标配置数组
 */
function getTargets(processedConfig) {
  // 支持的目标平台列表
  const supportedTargetNames = ['win', 'mac', 'linux'];
  const targetConfigs = [];
  
  // 收集所有已配置的平台目标
  for (const targetName of supportedTargetNames) {
    if (processedConfig.config[targetName]) {
      targetConfigs.push(processedConfig.config[targetName]);
    }
  }
  
  return targetConfigs;
}
// run();
/**
 * 执行构建过程，将原始配置转换为实际构建操作
 * @param {Object} rawBuildOptions - 原始构建选项
 * @param {string} dependenciesAsarPath - 依赖 asar 文件路径
 * @returns {Promise<Array>} 构建结果数组
 */
async function raw2Build(rawBuildOptions, dependenciesAsarPath) {
  // 确保 node_modules 被排除在主打包之外
  if (rawBuildOptions.config.files.length !== 0) {
    const fileFilter = rawBuildOptions.config.files[0].filter;
    if (!fileFilter.includes('!node_modules')) {
      fileFilter.push('!node_modules');
    }
  }
  
  // 如果提供了依赖路径，将其添加到所有目标的额外文件中
  if (dependenciesAsarPath) {
    for (const targetConfig of getTargets(rawBuildOptions)) {
      // 确保额外文件数组存在
      targetConfig.extraFiles = targetConfig.extraFiles ?? [];
      
      // 添加依赖 asar 文件到 resources 目录
      targetConfig.extraFiles.push({
        from: dependenciesAsarPath,
        to: './resources'
      });
    }
  }

  // 创建打包器并执行构建
  const packager = new Packager(rawBuildOptions);
  return await packager.build();
}

/**
 * 将模块目录打包成 asar 文件
 * @param {string} modulesDirectory - 模块目录路径
 * @param {string} outputDirectory - 输出目录
 * @returns {Promise<string>} 生成的 asar 文件路径
 */
async function doArchive(modulesDirectory, outputDirectory) {
  const asarOutputPath = path.join(outputDirectory, 'deps.asar');
  await asar.createPackage(modulesDirectory, asarOutputPath);
  return asarOutputPath;
}
// 临时目录前缀，使用进程 ID 和时间戳确保唯一性
const tempDirectoryPrefix = `${process.pid.toString(36)}-${Date.now().toString(36)}`;
let temporaryFileCounter = 0;

/**
 * 生成唯一的临时文件/目录名
 * @param {string} prefix - 可选的前缀
 * @returns {string} 唯一的临时名称
 */
function getTempName(prefix) {
  return `${prefix == null ? '' : `${prefix}-`}${tempDirectoryPrefix}-${(temporaryFileCounter++).toString(36)}`;
}
/**
 * 执行完整的构建流程
 * @param {string} projectRoot - 项目根目录
 * @param {string} configFilePath - 配置文件路径
 */
async function doBuild(projectRoot, configFilePath) {
  // 获取项目目录和配置
  const projectDirectory = projectRoot;
  const rawBuildConfig = await getRawConfig(projectDirectory, configFilePath);
  
  // 标准化构建选项
  const normalizedBuildOptions = normalizeOptions({
    config: rawBuildConfig
  });
  
  // 创建打包器实例
  const packager = new Packager(normalizedBuildOptions);
  
  // 创建临时目录用于分离依赖
  const nodeModulesTempDir = path.join(os.tmpdir(), getTempName());
  console.log(`临时目录: ${nodeModulesTempDir}`);
  
  try {
    // 分离依赖到临时目录
    await splitDeps(packager, nodeModulesTempDir);
    
    // 将依赖打包成 asar 文件
    const dependenciesAsarPath = await doArchive(
      path.join(nodeModulesTempDir, 'node_modules'), 
      path.join(nodeModulesTempDir, 'temp')
    );
    
    // 执行主构建过程
    await raw2Build(normalizedBuildOptions, dependenciesAsarPath);
  } finally {
    // 清理临时目录
    await fs.promises.rm(nodeModulesTempDir, { recursive: true, force: true });
  }
}
// 获取项目根目录和配置文件路径
const projectRootDirectory = process.cwd();
const electronBuilderConfigPath = path.join(
  projectRootDirectory, 
  'config', 
  'electron-build', 
  'electron-builder.yml'
);

// 执行构建流程
doBuild(projectRootDirectory, electronBuilderConfigPath);
