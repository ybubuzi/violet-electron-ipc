/**
 * Promise 扩展模块
 *
 * 本模块基于 ES2025 规范为全局 Promise 对象添加实用方法，包括：
 * - Promise.try: 将同步/异步函数提升为 Promise
 * - Promise.withResolvers: 创建可外部控制的 Promise
 * - 异步上下文管理: 基于 AsyncLocalStorage 的上下文传播
 *
 * @fileoverview Promise 实用工具扩展
 * @author Violet Team
 * @since 1.0.0
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import assert from 'assert';

// @ts-ignore - 检查是否已经扩展过，避免重复扩展
if (!Promise.__extended__) {
  // @ts-ignore - 标记已扩展
  Promise.__extended__ = true;

  /**
   * Promise.try - 基于ES2025规范的实现
   *
   * 将任意函数（同步或异步）的结果包装成 Promise。
   * 如果函数抛出异常，自动转换为 rejected Promise。
   *
   * @param func - 要执行的函数，可以是同步或异步函数
   * @param args - 传递给函数的参数
   * @returns 包装函数执行结果的 Promise
   */
  // @ts-ignore
  Promise.try = function (func: Function, ...args: any[]) {
    if (typeof func !== 'function') {
      return Promise.resolve(func);
    }
    return new Promise(function (resolve) {
      resolve(func(...args));
    });
  };

  /**
   * 异步本地存储实例，用于在整个异步调用链中传播上下文数据
   * 基于 Node.js 的 AsyncLocalStorage 实现
   */
  // @ts-ignore
  Promise.MAIN_LOCAL_SANDBOX = new AsyncLocalStorage();

  /**
   * 获取当前异步上下文中存储的数据
   *
   * 必须在通过 runContext 创建的异步上下文中调用，
   * 否则会抛出断言错误
   *
   * @returns 当前上下文中存储的数据
   * @throws {AssertionError} 当没有可用的存储时抛出
   */
  // @ts-ignore
  Promise.getContext = function <T>(): T {
    // @ts-ignore
    const store = Promise.MAIN_LOCAL_SANDBOX.getStore();
    if (!store) {
      assert.fail('No store available');
    }
    return store as T;
  };

  /**
   * Promise.withResolvers - 基于ES2025规范的实现
   *
   * 创建一个 Promise 和对应的 resolve/reject 函数。
   * 这在某些需要在 Promise 外部控制其状态的场景中非常有用，
   * 比如事件驱动的异步操作或需要延迟解决的情况。
   *
   * @returns 包含 promise、resolve 和 reject 函数的对象
   */
  // @ts-ignore
  Promise.withResolvers = function <T>() {
    let resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void;
    const promise = new Promise<T>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    return {
      promise,
      resolve,
      reject
    };
  };

  /**
   * 在指定的异步上下文中执行函数
   *
   * 使用 AsyncLocalStorage 创建异步上下文，确保在整个异步调用链中
   * 都能访问到相同的上下文数据。这对于请求跟踪、日志关联、
   * 用户身份传播等场景非常有用。
   *
   * @param context - 要存储在上下文中的数据，可以是任意类型
   * @param fn - 要在上下文中执行的异步函数
   * @returns 包含函数执行结果的 Promise
   *
   * @example
   * // 请求追踪示例
   * const requestId = generateRequestId();
   * await Promise.runContext({ requestId }, async () => {
   *   // 在整个请求处理过程中都可以访问到 requestId
   *   await processData();
   *   await saveToDatabase();
   *   await sendNotification();
   * });
   */
  // @ts-ignore
  Promise.runContext = async function (context: unknown, fn: () => Promise<unknown>) {
    // @ts-ignore - 创建可控 Promise 来捕获异步执行结果
    const { promise, resolve, reject } = Promise.withResolvers();

    // @ts-ignore - 在指定上下文中执行函数
    Promise.MAIN_LOCAL_SANDBOX.run(context, async () => {
      try {
        // 执行函数并将结果传递给 resolve
        resolve(await fn());
      } catch (error) {
        // 捕获异常并传递给 reject
        reject(error);
      }
    });

    return promise;
  };
}
