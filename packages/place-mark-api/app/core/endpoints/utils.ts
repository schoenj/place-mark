import { Request, ResponseToolkit, Server } from "@hapi/hapi";
import { Controller } from "./controller.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerController<T extends Controller>(server: Server, controller: any, initFn: () => T) {
  if (!controller.prototype.routes) {
    throw new Error("");
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const route of controller.prototype.routes) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hapiRoute = (Object as any).assign({}, route);
    hapiRoute.handler = (request: Request, h: ResponseToolkit) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tmp = initFn() as any;
      tmp.setContext(request, h);
      return tmp[route.handlerName](request, h);
    };
    delete hapiRoute.handlerName;
    server.route(hapiRoute);
  }
}
