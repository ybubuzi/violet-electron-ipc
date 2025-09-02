export {};

declare global {
  /** 全局日志打印门面 */
  const logger: import('winston').Logger;

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
    format(...args: any[]): string;
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
    rawEx(callSite: TemplateStringsArray, ...substitutions: any[]): string;
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
     * @param func
     * @param args
     * @example
     * // 下面的示例接受一个回调函数，将其“提升”为一个 promise，处理结果，并进行一些错误处理：
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
  }
}
