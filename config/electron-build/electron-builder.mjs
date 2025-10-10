import fs from 'fs';
import path from 'path';

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')).toString());
const name = pkg.name;
const version = pkg.version;
const productName = pkg.productName ?? name;
const buildTime = new Date()
  .toLocaleString()
  .replace(/[\/\s:]/g, '')
  .substring(0, 12);

export default {
  appId: pkg.appId, // 从 package.json 的 appId 字段获取（com.example.myapp）
  productName: productName,
  directories: {
    output: `dist/${buildTime}`
  },
  /*
   * 第一个配置表示排除所有文件
   * 后续再单独声明哪些文件需要打包进行asar文件中
   */
  files: ['!**/*', 'out', 'node_modules', 'package.json'],
  /** 该列表下的文件将不会被归档 */
  asarUnpack: ['resources/**'],
  /** windows下的打包配置 */
  win: {
    /** 打包后的exe的名称 */
    executableName: name,
    /**
     * 配置打包方式
     * nsis: 将生成一个单文件的安装程序
     * nsis-web:
     * portable: 便携版本无需安装，生成单个执行文件点击即可运行，
     *          原理：实际依旧是将生成物归档，运行时解压至Temp目录然后运行
     * appx:
     * msi:
     * msi-wrapped:
     * squirrel:
     * 压缩包形式： 7z, zip, tar.xz, tar.lz, tar.gz, tar.bz2
     * dir: 不进行归档
     */
    target: ['portable']
  },
  nsis: {
    artifactName: `${name}-${version}-setup-${buildTime}.\$\{ext\}`,
    shortcutName: productName,
    uninstallDisplayName: `卸载${productName}`,
    createDesktopShortcut: 'always'
  },
  npmRebuild: false
};
