import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { run } from '../ctx';

const controllers: any = import.meta.glob('./controller/**/*.ts', { eager: true });

for (const key in controllers) {
  if (Object.prototype.hasOwnProperty.call(controllers, key)) {
    const controller = controllers[key];
    for (const keyModule in controller) {
      const module = controller[keyModule];

      const isController: boolean = Reflect.hasMetadata('interfaceName', module);
      const hasRoutes: boolean = Reflect.hasMetadata('routes', module);
      if (!isController || !hasRoutes) {
        continue;
      }
      const interfaceName = Reflect.getMetadata('interfaceName', module);
      const routes = Reflect.getMetadata('routes', module);
      const instance = new module();
      routes.forEach((route) => {
        const member = instance[route.propertyKey];
        //获取类名
        const className = instance.constructor.name;
        //获取方法名
        const methodName = route.propertyKey;
        const postfix = interfaceName ? interfaceName : lowercaseFirst(className);
        //获取ipc事件名
        const ipcEventName = `${postfix}-${methodName}`;

        ipcMain.handle(ipcEventName, (event: IpcMainInvokeEvent, ...args: any[]) => {
          return run(event, () => {
            return Promise.resolve(member(...args, event));
          });
        });
        console.log(`controller: [${ipcEventName}] 注册了\n`);
      });
    }
  }
}
function lowercaseFirst(str: string) {
  if (str.length === 0) {
    return str; // 如果字符串为空，则返回原字符串
  }
  return str.charAt(0).toLowerCase() + str.slice(1); // 连接第一个字符的小写形式和剩余的字符串
}
