export interface Route {
  propertyKey: string | symbol;
}
/**
 * 装饰Ipc暴露类
 * @param interfaceName 指定实例接口名称 不传实例名称则默认使用类名 第一个字母小写
 * @returns
 */
export function IpcController(interfaceName: string = ''): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata('interfaceName', interfaceName, target);
  };
}
export type RouterDecoratorFactory = () => MethodDecorator;

export function createRouterDecorator(): RouterDecoratorFactory {
  return () => (target: any, propertyKey: string | symbol, _descriptor: PropertyDescriptor) => {
    const route: Route = {
      propertyKey
    };
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }
    const routes = Reflect.getMetadata('routes', target.constructor);
    routes.push(route);
  };
}
export const IpcMethod: RouterDecoratorFactory = createRouterDecorator();
