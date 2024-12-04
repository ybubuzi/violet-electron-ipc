import type UserController from '@/main/ipc/decorator/controller/UserController';
import type TestController from '@/main/ipc/decorator/controller/TestController';
type FunToPromise<T> = T extends (...args: infer Args) => infer R
  ? R extends Promise<infer U>
    ? (...args: Args) => Promise<U>
    : (...args: Args) => Promise<R>
  : never;

type PickFunToPromise<T, K extends keyof T> = {
  [P in K]: FunToPromise<T[P]>;
};
export type ControllerApi = {
   hadaController: PickFunToPromise<TestController, 'test'>;
   userController: PickFunToPromise<UserController, 'login' | 'test'>;
}
