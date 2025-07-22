/**
 * 返回‘hello world’ 字符串
 * @returns
 */
export function getMsg() {
  return 'hello world';
}
export function throwError1() {
  throw new Error('this is a error');
}
export function throwError2() {
  throw new Error('this is a super error');
}
export function throwError3() {
  return new Promise((r, e) => {
    e('12312313');
  });
}
export function getMsg2(name: string) {
  return `“hello ${name}” from main`;
}

export * as shy from './shy-girl';
