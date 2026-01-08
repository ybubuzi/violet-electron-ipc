import fs from "fs";
import path from "path";

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")).toString());
const name = pkg.name;
const version = pkg.version;
const productName = pkg.productName ?? name;
const author = pkg.author?.name ?? pkg.author ?? "";
const buildTime = new Date()
  .toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  .replace(/[/\s:]/g, "")
  .substring(0, 12);
const buildRoot = path.resolve(process.cwd(), "build", "nsis");

// UTF-8 BOM 头
const UTF8_BOM = "\uFEFF";

/**
 * 处理模板文件，替换占位符并输出为 UTF-8 with BOM 格式
 * @param {string} templatePath 模板文件路径 (*.example.*)
 * @param {string} outputPath 输出文件路径
 * @param {Record<string, string>} variables 替换变量
 */
function processTemplate(templatePath, outputPath, variables) {
  if (!fs.existsSync(templatePath)) return;
  let content = fs.readFileSync(templatePath, "utf-8");
  for (const [key, value] of Object.entries(variables)) {
    content = content.replaceAll(`\${${key}}`, value);
  }
  if (content.startsWith(UTF8_BOM)) {
    fs.writeFileSync(outputPath, content, "utf-8");
  } else {
    fs.writeFileSync(outputPath, UTF8_BOM + content, "utf-8");
  }
}

// 处理 license 模板
processTemplate(
  path.resolve(buildRoot, "license.example.txt"),
  path.resolve(buildRoot, "license.txt"),
  { productName, author },
);
/**
 * @type {import('electron-builder/node_modules/app-builder-lib').CommonConfiguration}
 */
const option = {
  appId: pkg.appId, // 从 package.json 的 appId 字段获取（com.example.myapp）
  productName: productName,
  directories: {
    output: `dist/${buildTime}`,
    buildResources: "build",
  },
  /*
   * 第一个配置表示排除所有文件
   * 后续再单独声明哪些文件需要打包进行asar文件中
   */
  files: ["!**/*", "out", "node_modules", "package.json"],
  /** 该列表下的文件将不会被归档 */
  asarUnpack: ["resources/**"],
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
    target: ["nsis"],
  },
  nsis: {
    artifactName: `${name}-${version}-setup-${buildTime}.` + "${ext}",
    shortcutName: productName,
    uninstallDisplayName: `卸载${productName}`,
    createDesktopShortcut: "always",
    // 是否一键安装
    oneClick: false,
    // 允许用户修改安装目录
    allowToChangeInstallationDirectory: true,
    perMachine: true,
    // 许可证文件
    license: path.resolve(buildRoot, "license.txt"),
    // 自定义脚本（绝对路径）
    include: path.resolve(buildRoot, "installer.nsh"),
  },
  npmRebuild: false,
  // 保留需要的语言文件
  electronLanguages: ["zh-CN", "en-US"],
};

export default option;
