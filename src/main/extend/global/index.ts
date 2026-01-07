import { createRequire } from "module";
// @ts-ignore - custom global extension flag
if (!global.__extended__) {
  // @ts-ignore - custom global extension flag
  global.__extended__ = true;
  // @ts-ignore - global sleep utility
  global.sleep = async function sleep(timeout: number = 50) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  };
  const require = createRequire(import.meta.url);
  // @ts-ignore - global require for ESM
  global.require = require;
}
