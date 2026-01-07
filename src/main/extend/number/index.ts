// @ts-ignore - Number prototype extension
if (!Number.prototype.bitAt) {
  // @ts-ignore - Number prototype extension
  Number.prototype.bitAt = function (offset: number) {
    const val = +this;
    return (val >> offset) & 1;
  };
}
// @ts-ignore - Number prototype extension
if (!Number.prototype.bitMask) {
  // @ts-ignore - Number prototype extension
  Number.prototype.bitMask = function (mask: number) {
    const offset = Math.log2(mask) | 0;
    // @ts-ignore - call custom bitAt
    return this.bitAt(offset);
  };
}
