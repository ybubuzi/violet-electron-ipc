export {};

declare global {
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
}
