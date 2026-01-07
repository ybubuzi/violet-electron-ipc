export function equal<T>(a: T, b: T) {
  if (a === b) return true;
  if (a && b && typeof a == "object" && typeof b == "object") {
    if (a.constructor !== b.constructor) {
      return false;
    }
    let length, i;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != (b as Array<unknown>).length) {
        return false;
      }
      for (i = length; i-- !== 0; ) {
        if (!equal(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }

    if (a.constructor === RegExp) {
      return (
        (a as RegExp).source === (b as unknown as RegExp).source &&
        (a as RegExp).flags === (b as unknown as RegExp).flags
      );
    }
    if (a.valueOf !== Object.prototype.valueOf) {
      return a.valueOf() === b.valueOf();
    }
    if (a.toString !== Object.prototype.toString) {
      return a.toString() === b.toString();
    }
    const keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) {
      return false;
    }
    for (i = length; i-- !== 0; ) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) {
        return false;
      }
    }

    for (i = length; i-- !== 0; ) {
      const key = keys[i];
      if (!equal(a[key], b[key])) {
        return false;
      }
    }
    return true;
  }
  return a !== a && b !== b;
}
