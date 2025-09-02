// @ts-ignore
if (Promise.__extended__) {
  // @ts-ignore
  Promise.__extended__ = true;
  // @ts-ignore
  Promise.try = function (func: Function, ...args: any[]) {
    if (typeof func !== 'function') {
      return Promise.resolve(func);
    }
    return new Promise(function (resolve) {
      resolve(func(...args));
    });
  };
}
