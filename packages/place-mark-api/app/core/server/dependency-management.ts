import { Request, ResponseToolkit, Server } from "@hapi/hapi";
import { IContainer } from "../../dependencies/interfaces/index.js";

declare module "@hapi/hapi" {
  /**
   * Extends the @hapi Request-Object to configure a container
   */
  interface Request {
    /**
     * Gets the container
     */
    container: IContainer;
  }
}

/**
 * Configures the Hapi Server to initiate a container on every request
 *
 * @param server The Server to configure
 * @param containerFactory A function that creates the Container
 */
export function registerDependencyManagement(server: Server, containerFactory: () => IContainer): void {
  server.ext("onRequest", async (request: Request, h: ResponseToolkit) => {
    request.container = containerFactory();
    return h.continue;
  });
}
