/**
 * Electron 应用窗口工具模块更为清晰的理解实现
 * 提供窗口管理、快捷键处理、平台检测等通用功能
 * 直接拷贝的 @electron-toolkit/utils 代码
 *
 * @see https://github.com/alex8088/electron-toolkit
 */
import { app, session, BrowserWindow, BrowserView } from 'electron';

/**
 * 窗口快捷键配置选项
 */
type ShortcutOptions = {
  /**
   * 使用`ESC`键关闭当前窗口, 默认 `false`.
   */
  escToCloseWindow?: boolean;
  /**
   * 允许窗口缩放，默认 `false`.
   */
  zoom?: boolean;
};

/**
 * 环境检测工具
 * 用于判断当前运行环境是否为开发模式
 */
const is = {
  // 当前是否是开发环境（通过是否打包来判断）
  dev: !app.isPackaged
};

/**
 * 平台检测工具
 * 提供跨平台兼容性支持
 */
const platform = {
  // Windows 平台检测
  isWindows: process.platform === 'win32',
  // macOS 平台检测
  isMacOS: process.platform === 'darwin',
  // Linux 平台检测
  isLinux: process.platform === 'linux'
};

/**
 * Electron 应用配置工具
 * 处理应用级别的设置和系统集成
 */
const electronApp = {
  /**
   * 设置 Windows 系统的应用用户模型 ID
   * 用于任务栏图标分组、通知等功能
   * @param id 应用的唯一标识符
   */
  setAppUserModelId(id: string) {
    if (platform.isWindows) app.setAppUserModelId(is.dev ? process.execPath : id);
  },

  /**
   * 设置应用开机自启动
   * @param auto 是否开启自启动
   * @returns boolean 设置是否成功
   */
  setAutoLaunch(auto: boolean) {
    // Linux 平台暂时不支持此功能
    if (platform.isLinux) return false;

    const isOpenAtLogin = () => {
      return app.getLoginItemSettings().openAtLogin;
    };

    // 检查当前设置是否与期望一致，不一致则进行修改
    if (isOpenAtLogin() !== auto) {
      app.setLoginItemSettings({ openAtLogin: auto });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },

  /**
   * 跳过系统代理设置
   * 使用直连模式，避免网络请求被代理影响
   * @returns Promise<boolean> 设置是否成功
   */
  skipProxy() {
    return session.defaultSession.setProxy({ mode: 'direct' });
  }
};

/**
 * 窗口优化工具
 * 处理快捷键绑定和窗口交互优化
 */
const optimizer = {
  /**
   * 监听窗口快捷键事件
   * 处理开发工具快捷键、窗口关闭、缩放控制等
   * @param window 目标窗口实例
   * @param shortcutOptions 快捷键配置选项
   */
  watchWindowShortcuts(window: BrowserWindow | BrowserView, shortcutOptions?: ShortcutOptions) {
    if (!window) return;
    const { webContents } = window;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};

    // 监听键盘输入事件
    webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown') {
        // 生产环境下禁用开发者工具快捷键
        if (!is.dev) {
          // 禁用 Ctrl+R / Cmd+R 刷新快捷键
          if (input.code === 'KeyR' && (input.control || input.meta)) event.preventDefault();
          // 禁用 Ctrl+Shift+I / Alt+Cmd+I 开发者工具快捷键
          if (input.code === 'KeyI' && ((input.alt && input.meta) || (input.control && input.shift))) {
            event.preventDefault();
          }
        } else {
          // 开发环境下支持 F12 切换开发者工具
          if (input.code === 'F12') {
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({ mode: 'undocked' });
              console.log('Open dev tool...');
            }
          }
        }

        // ESC 键关闭窗口（如果启用）
        if (escToCloseWindow) {
          if (input.code === 'Escape' && input.key !== 'Process') {
            if (window instanceof BrowserWindow) {
              window.close();
            }
            event.preventDefault();
          }
        }

        // 禁用缩放快捷键（如果未启用缩放功能）
        if (!zoom) {
          // 禁用 Ctrl+Minus / Cmd+Minus 缩小
          if (input.code === 'Minus' && (input.control || input.meta)) event.preventDefault();
          // 禁用 Ctrl+Shift+Equal / Cmd+Shift+Equal 放大
          if (input.code === 'Equal' && input.shift && (input.control || input.meta)) event.preventDefault();
        }
      }
    });
  }
};

/**
 * 导出工具模块
 * - electronApp: 应用级别配置工具
 * - is: 环境检测工具
 * - optimizer: 窗口优化工具
 * - platform: 平台检测工具
 */
export { electronApp, is, optimizer, platform };
