// @ts-ignore
if (!Number.prototype.bitAt) {
  // @ts-ignore
  Number.prototype.bitAt = function (offset: number) {
    const val = +this;
    return (val >> offset) & 1;
  };
}
// @ts-ignore
if (!Number.prototype.bitMask) {
  // @ts-ignore
  Number.prototype.bitMask = function (mask: number) {
    const offset = Math.log2(mask) | 0;
    // @ts-ignore
    return this.bitAt(offset);
  };
}
