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
  declare namespace IPC {
    /**
     * 程序内支持的通知类型
     */
    export interface NotifyTypeMap {
      hello: [string, number];
      login: { username: string; password: string };
      say: string;
    }
    export type NotifyEvent = keyof NotifyTypeMap;
    export type RemnantParams<T extends NotifyEvent> = DestructionTuple<NotifyTypeMap[T]>;
  }
}
