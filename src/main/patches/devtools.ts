import { app } from "electron";

/**
 * DevTools 补丁
 * 屏蔽开发工具中 Autofill 相关的异常打印
 * electron不支持自动填充功能，打开devtool时会调用相关组件导致终端异常打印
 * [29388:0108/110251.268:ERROR:CONSOLE:1] "Request Autofill.setAddresses failed. {"code":-32601,"message":"'Autofill.s wasn't found"}", source: devtools://devtools/bundled/core/protocol_client/protocol_client.js (1)
 * 该patch用于屏蔽
 */
export function patchDevToolsConsole(): void {
  app.on("web-contents-created", (_event, contents) => {
    contents.on("devtools-opened", () => {
      const injectScript = () => {
        contents.devToolsWebContents
          ?.executeJavaScript(
            `(() => {
              const origErr = console.error;
              console.error = function (...args) {
                const s = String(args[0] ?? "");
                if (s.includes("Autofill.enable") || s.includes("Autofill.setAddresses")) return;
                return origErr.apply(console, args);
              };
            })()`,
          )
          .catch(() => {
            /* ignore */
          });
      };

      injectScript();
      setTimeout(injectScript, 1000);
    });
  });
}
