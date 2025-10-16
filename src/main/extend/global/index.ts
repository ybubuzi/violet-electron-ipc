import { createRequire } from 'module';
// @ts-ignore
if (!global.__extended__) {
  // @ts-ignore
  global.__extended__ = true;
  // @ts-ignore
  global.sleep = async function sleep(timeout: number = 50) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  };
  const require = createRequire(import.meta.url);
  // @ts-ignore
  global.require = require;
}
