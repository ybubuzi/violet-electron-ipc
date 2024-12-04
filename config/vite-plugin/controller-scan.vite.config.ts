import ts from 'typescript';
import path from 'path';
import fs from 'fs';
import type { UserConfig } from 'electron-vite';
/* worker进程标识超类 */
const CONTROLLER_MODIFIER_NAME = 'IpcController';
const IPC_METHOD_MODIFIER_NAME = 'IpcMethod';

interface BuildInfo {
  methods: string[];
  className: string;
  interfaceName: string;
  path: string;
}

/**
 *
 * @param {ts.SourceFile} sourceFile
 * @returns {boolean}
 */
function isMainPath(sourceFile) {
  return sourceFile.fileName.startsWith('src/main');
}

function parseProject(tsConfigPath, tsRootPath = './config/typescript') {
  const config = ts.readConfigFile(tsConfigPath, ts.sys.readFile).config;
  const parsedCommandLine = ts.parseJsonConfigFileContent(config, ts.sys, tsRootPath, {
    project: 'src/main'
  });
  const program = ts.createProgram(parsedCommandLine.fileNames, parsedCommandLine.options);
  const sourceFiles = program.getSourceFiles();
  const buildInfos: BuildInfo[] = [];
  for (const sourceFile of sourceFiles) {
    if (!isMainPath(sourceFile)) {
      continue;
    }
    if (sourceFile.isDeclarationFile) {
      continue;
    }
    // 获取文件中所有导出的类
    const classes = sourceFile.statements.filter((statement) => ts.isClassDeclaration(statement));
    if (classes.length === 0) {
      continue;
    }
    for (const clazz of classes) {
      // 获取该类的类装饰器
      const modifiers = clazz.modifiers;
      if (!modifiers) {
        continue;
      }
      let modifier;
      let hasExport = false;
      for (const _modifier of modifiers) {
        if (_modifier.kind == ts.SyntaxKind.ExportKeyword) {
          hasExport = true;
          continue;
        }
        if (_modifier.kind == ts.SyntaxKind.Decorator) {
          // @ts-ignore
          const modifierName = _modifier?.expression?.expression.escapedText;
          if (modifierName != CONTROLLER_MODIFIER_NAME) {
            continue;
          } else {
            modifier = _modifier;
          }
        }
      }
      if (!modifier) {
        continue;
      }
      const className = clazz.name?.escapedText ?? '';
      if (!hasExport) {
        throw new Error(`业务类【${className}】未能正确导出，请使用export导出`);
      }
      if (!modifier) {
        throw new Error('未能设置worker对应的启动装饰器');
      }
      const methods: string[] = [];
      clazz.members.forEach((item) => {
        if (item.kind === ts.SyntaxKind.MethodDeclaration) {
          // @ts-ignore
          const modifiers = item.modifiers;
          if (modifiers) {
            modifiers.forEach((_modifier) => {
              const modifierName = _modifier?.expression?.expression.escapedText;
              // console.log('modifier', modifierName);
              if (modifierName === IPC_METHOD_MODIFIER_NAME) {
                // @ts-ignore
                methods.push(item.name?.escapedText);
              }
            });
          }
        }
      });

      const args = modifier.expression.arguments;
      let interfaceName = args[0]?.text ?? className;
      interfaceName = lowercaseFirst(interfaceName);
      buildInfos.push({
        methods,
        className,
        interfaceName,
        path: sourceFile.fileName
      });
    }
  }
  return buildInfos;
}

function lowercaseFirst(str: string) {
  if (str.length === 0) {
    return str; // 如果字符串为空，则返回原字符串
  }
  return str.charAt(0).toLowerCase() + str.slice(1); // 连接第一个字符的小写形式和剩余的字符串
}

function infoToCode(buildInfo: BuildInfo[]) {
  const dtsContent = [`export type ControllerApi = {`];
  dtsContent.unshift(`type FunToPromise<T> = T extends (...args: infer Args) => infer R
  ? R extends Promise<infer U>
    ? (...args: Args) => Promise<U>
    : (...args: Args) => Promise<R>
  : never;

type PickFunToPromise<T, K extends keyof T> = {
  [P in K]: FunToPromise<T[P]>;
};`);
  for (const { methods, path, className, interfaceName } of buildInfo) {
    dtsContent.unshift(`import type ${className} from '@/main/ipc/decorator/controller/${className}';`);
    const methodsStr = methods.map((item) => `'${item}'`);
    dtsContent.push(`   ${interfaceName}: PickFunToPromise<${className}, ${methodsStr.join(' | ')}>;`);
  }
  dtsContent.push(`}`);
  const dts = dtsContent.join('\n') + '\n';
  return dts;
}

function scanPlugin() {
  const pwd = process.cwd();
  const targetPath = path.resolve(pwd, 'src', 'preload', 'ControllerApi.d.ts');
  const tsConfigPath = path.resolve(pwd, 'config', 'typescript', 'tsconfig.node.json');

  return {
    name: 'vite-plugin-worker-conf',
    config() {
      const infos = parseProject(tsConfigPath);
      const code = infoToCode(infos);
      fs.writeFileSync(targetPath, code, {
        flag: 'w+'
      });
    }
  };
}

export function usePlugin(config: UserConfig) {
  config.main!.plugins = config.main!.plugins ?? [];
  config.main!.plugins.push(scanPlugin());
  return config;
}
export default usePlugin;
