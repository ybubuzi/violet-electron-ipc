import { createRequire } from 'node:module';
import pkg from '../../package.json' assert { type: 'json' };
import yml from 'js-yaml';
import path from 'path';
import fs from 'fs';
import { cac } from 'cac';
const require = createRequire(import.meta.url);

// export interface DevCLIOptions {
//   inspect?: boolean | string;
//   inspectBrk?: boolean | string;
//   remoteDebuggingPort?: string;
//   noSandbox?: boolean;
//   rendererOnly?: boolean;
//   win?: boolean | string;
//   mac?: boolean | string;
//   linux?: boolean | string;
// }

// export interface GlobalCLIOptions {
//   '--'?: string[];
//   c?: boolean | string;
//   config?: string;
//   l?: LogLevel;
//   logLevel?: LogLevel;
//   clearScreen?: boolean;
//   d?: boolean | string;
//   debug?: boolean | string;
//   f?: string;
//   filter?: string;
//   m?: string;
//   mode?: string;
//   ignoreConfigWarning?: boolean;
//   sourcemap?: boolean;
//   w?: boolean;
//   watch?: boolean;
//   outDir?: string;
//   entry?: string;
// }
/**
 *
 * @param {string} root
 * @param {any} options
 * @returns {Promise<void>}
 */
async function doBuild(root, options) {
  root = root ?? process.cwd();

  const { Packager, Platform } = require('app-builder-lib');
  const { getConfig, validateConfig } = require('app-builder-lib/out/util/config');
  const { createElectronFrameworkSupport } = require('app-builder-lib/out/electron/ElectronFramework.js');

  let platform = Platform.current();
  if (options.win) {
    platform = Platform.WINDOWS;
  } else if (options.mac) {
    platform = Platform.MAC;
  } else if (options.linux) {
    platform = Platform.LINUX;
  }
  let ymlPath = path.join(root, 'config', 'electron-build', 'electron-builder.yml');
  if (options.config) {
    ymlPath = options.config;
  }
  if (!fs.existsSync(ymlPath)) {
    throw new Error(`not found electron-builder.yml in ${path.join(root, ymlPath)}`);
  }
  const content = await fs.promises.readFile(ymlPath, 'utf8');
  const originConfig = yml.load(content);
  const afterSign = originConfig.afterSign;
  if (afterSign) {
    process.env['_afterSign'] = afterSign;
  }

  const map = new Map();
  map.set(platform, new Map());

  // @ts-ignore electron-config
  const buildOptions = {
    targets: map,
    config: undefined
  };
  yml.load();
  buildOptions.config = await getConfig(process.cwd(), ymlPath, {
    asar: false,
    afterSign: path.join(root, 'config', 'electron-build', 'split-asar-builder-handle.cjs')
  });
  const packager = new Packager(buildOptions);
  validateConfig(buildOptions.config, packager.debugLogger);
  const framework = await createElectronFrameworkSupport(buildOptions.config, packager);
  Reflect.set(packager, '_framework', framework);
  await packager.build();
}

const cli = cac('split-asar-builder');
cli
  .command('[root]', 'build electron project')
  .option('--win', 'Packaged for the Windows platform')
  .option('--mac', 'Packaged for the Mac platform')
  .option('--linux', 'Packaged for the Linux platform')
  .option('--config <config>', 'electron-builder config file path')
  .action(async (root, options) => {
    await doBuild(root, options);
  });
cli.help();
cli.version(pkg.version);
cli.parse();
