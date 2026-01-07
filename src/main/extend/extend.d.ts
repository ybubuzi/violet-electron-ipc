export {};

declare global {
  /** 全局日志打印门面 */
  const logger: import("winston").Logger;

  interface String {
    /**
     * 格式化字符串, 支持数字补零和自定义小数位数
     * @param args 要替换占位符的参数
     * @returns 格式化后的字符串
     * @example
     * // 基本用法
     * 'Hello, {0}!'.format('World'); // 'Hello, World!'
     *
     * // 多个参数
     * '敏捷的{0}狐狸跳过了懒惰的{1}'.format('棕色', '狗'); // '敏捷的棕色狐狸跳过了懒惰的狗'
     *
     * // 数字补零 (根据格式化字符串中'0'的数量)
     * 'Value: {0:000}'.format(5); // 'Value: 005'
     * 'Value: {0:00}'.format(123); // 'Value: 123'
     *
     * // 小数位数 (根据格式化字符串中小数点后的位数)
     * '价格: {0:0.00}'.format(12.3); // '价格: 12.30'
     * '价格: {0:0.000}'.format(12.3456); // '价格: 12.346'
     * '价格: {0:0.000}'.format(-12.3456); // '价格: -12.346'
     */
    format(...args: unknown[]): string;
  }

  interface StringConstructor {
    /**
     * 增强版的 String.raw, 用于创建多行字符串, 自动去除多余的公共前导缩进.
     * 这在编写嵌入代码块 (如 SQL, HTML) 时非常有用, 可以保持源代码的可读性, 同时生成整洁的字符串.
     *
     * @param callSite 模板字符串调用点对象.
     * @param substitutions 模板字符串中的插值.
     * @returns 移除了公共缩进并处理了插值的字符串.
     * @example
     * // 源代码中为了对齐而添加的空格会被移除
     * const query = String.rawEx`
     *   SELECT
     *     id,
     *     name
     *   FROM
     *     users
     *   WHERE
     *     age > ${25};
     * `;
     * // 输出:
     * // SELECT
     * //   id,
     * //   name
     * // FROM
     * //   users
     * // WHERE
     * //   age > 25;
     * // (注意: 'id', 'name' 前的相对缩进被保留)
     */
    rawEx(callSite: TemplateStringsArray, ...substitutions: unknown[]): string;
  }

  interface Number {
    /**
     * 获取数字在指定偏移位置的位(0或1)
     * @param offset - 从右到左的偏移量 (0-based)
     * @returns 0 或 1
     * @example
     * // 对于数字 5 (二进制 0101)
     * (5).bitAt(0); // 1
     * (5).bitAt(1); // 0
     * (5).bitAt(2); // 1
     * (5).bitAt(3); // 0
     */
    bitAt(offset: number): number;

    /**
     * 通过掩码获取数字在指定位置的位(0或1)
     * 注意: 掩码必须是2的幂 (e.g., 1, 2, 4, 8, ...).
     * @param mask - 用于计算位偏移的掩码 (例如: 1, 2, 4, 8)
     * @returns 0 或 1
     * @example
     * // 对于数字 5 (二进制 0101)
     * (5).bitMask(1);  // 1 (检查第0位)
     * (5).bitMask(2);  // 0 (检查第1位)
     * (5).bitMask(4);  // 1 (检查第2位)
     * (5).bitMask(8);  // 0 (检查第3位)
     */
    bitMask(mask: number): number;
  }

  interface PromiseConstructor {
    /**
     * 基于ES2025的Promise.try实现
     * 接受一个任意类型的回调函数（无论其是同步或异步，返回结果或抛出异常），
     * 并将其结果封装成一个 Promise
     * @param func - 要执行的回调函数，可以是同步或异步函数
     * @param args - 传递给回调函数的参数列表
     * @returns 包含函数执行结果的 Promise
     * @example
     * // 下面的示例接受一个回调函数，将其"提升"为一个 promise，处理结果，并进行一些错误处理：
     * function doSomething(action) {
     *   return Promise.try(action)
     *     .then((result) => console.log(result))
     *     .catch((error) => console.error(error))
     *     .finally(() => console.log("完成"));
     * }
     *
     * doSomething(() => "同步的结果");
     *
     * doSomething(() => {
     *   throw new Error("同步的错误");
     * });
     *
     * doSomething(async () => "异步的结果");
     *
     * doSomething(async () => {
     *   throw new Error("异步的错误");
     * });
     */
    try<T = unknown>(func: Function, ...args: unknown[]): Promise<T>;

    /**
     * 基于ES2025的Promise.withResolvers实现
     * 创建一个 Promise 和对应的 resolve/reject 函数，可以在外部控制 Promise 的状态
     * 这在某些异步操作需要在 Promise 外部被解决的场景中非常有用
     * @returns 包含 promise、resolve 和 reject 函数的对象
     * @example
     * // 基本用法
     * const { promise, resolve, reject } = Promise.withResolvers<string>();
     *
     * // 在其他地方解决 promise
     * setTimeout(() => resolve("异步完成"), 1000);
     *
     * promise.then(value => console.log(value)); // "异步完成"
     *
     * // 也可以拒绝
     * const { promise: errorPromise, reject: rejectFn } = Promise.withResolvers();
     * setTimeout(() => rejectFn(new Error("操作失败")), 500);
     */
    withResolvers<T>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: unknown) => void;
    };

    /**
     * 获取当前异步上下文中的存储值
     * 需要在 runContext 创建的上下文中使用，否则会抛出断言错误
     * @returns 当前异步上下文中存储的数据
     * @example
     * // 在 runContext 中使用
     * await Promise.runContext({ userId: 123 }, async () => {
     *   const context = Promise.getContext<{ userId: number }>();
     *   console.log(context.userId); // 123
     * });
     *
     * // 错误用法：在上下文外调用会抛出异常
     * try {
     *   Promise.getContext();
     * } catch (error) {
     *   console.error(error.message); // "No store available"
     * }
     */
    getContext<T>(): T;

    /**
     * 在指定的异步上下文中执行函数
     * 使用 Node.js 的 AsyncLocalStorage 来创建和传播异步上下文，
     * 确保在整个异步调用链中都能访问到相同的上下文数据
     * @param context - 要存储的上下文数据，可以是任意类型
     * @param fn - 要在上下文中执行的异步函数
     * @returns 包含函数执行结果的 Promise
     * @example
     * // 基本用法
     * const context = { requestId: 'abc123', user: '张三' };
     *
     * await Promise.runContext(context, async () => {
     *   // 在这个异步函数及其调用的所有异步函数中，都可以访问到相同的上下文
     *   const ctx = Promise.getContext();
     *   console.log(ctx.user); // "张三"
     *
     *   // 即使在更深层的异步调用中也能获取到上下文
     *   await someAsyncOperation();
     * });
     *
     * // 配合其他工具使用
     * function logWithContext(message: string) {
     *   const context = Promise.getContext<{ requestId: string }>();
     *   console.log(`[${context.requestId}] ${message}`);
     * }
     */
    runContext<T>(context: unknown, fn: () => Promise<T>): Promise<T>;
  }
}
