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
