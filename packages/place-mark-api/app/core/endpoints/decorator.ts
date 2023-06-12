import { ServerRoute } from "@hapi/hapi";

export function Route(config: ServerRoute) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  return function (target: any, methodName: string, _: PropertyDescriptor): void {
    target.routes = target.routes || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config as any).handlerName = methodName;
    target.routes.push(config);
  };
}
