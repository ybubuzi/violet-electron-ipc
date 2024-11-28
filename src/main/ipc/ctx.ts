import { AsyncLocalStorage } from 'node:async_hooks';
import assert from 'assert';
const asyncLocalStorage = new AsyncLocalStorage();

/**
 * 获取当前异步上下文对象
 * @returns 
 */
export function getStore<T>(): T {
  const store = asyncLocalStorage.getStore();
  if (!store) {
    assert.fail('No store available');
  }
  return store as T;
}

/**
 * 封装异步上下文执行
 * 封装范围内，异步上下文保持一致
 * @param subject 
 * @param callback 
 * @returns 
 */
export function run(subject: unknown, callback: () => Promise<unknown>) {
  return new Promise((resolve, reject) => {
    asyncLocalStorage.run(subject, async () => {
      try {
        const result = await callback();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
}
