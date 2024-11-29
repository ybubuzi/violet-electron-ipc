export {};

declare global {
  /** 判定一个类型是否是元组，若为元组返回自身 */
  type IsTuple<T> = T extends [infer First, ...infer Rest] ? T : never;
  /* 解构一个元组，将其平摊展开,若不是元组则返回自身 */
  type DestructionTuple<T> =
    IsTuple<T> extends never
      ? [T]
      : T extends [infer F, ...infer R]
        ? R['length'] extends 0
          ? [F]
          : [F, ...DestructionTuple<R>]
        : [never];
}
