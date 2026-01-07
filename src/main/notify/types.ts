/**
 * 程序内支持的通知类型
 */
export interface NotifyTypeMap {
  hello: [string, number];
  login: { username: string; password: string };
  say: string;
  cool: (msg: string) => void;
}
export type NotifyEvent = keyof NotifyTypeMap;
export type RemnantParams<T extends NotifyEvent> = NotifyTypeMap[T] extends (
  ...args: unknown[]
) => unknown
  ? Parameters<NotifyTypeMap[T]>
  : DestructionTuple<NotifyTypeMap[T]>;
export type NotifyCallback<T extends NotifyEvent> = NotifyTypeMap[T] extends (
  ...args: unknown[]
) => unknown
  ? NotifyTypeMap[T]
  : (...params: DestructionTuple<NotifyTypeMap[T]>) => void;
