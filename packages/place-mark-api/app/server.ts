import { Server } from "@hapi/hapi";
import { fileURLToPath } from "url";
import path from "path";
import Joi from "joi";
import Inert from "@hapi/inert";
import HapiSwagger, { RegisterOptions as SwaggerOptions } from "hapi-swagger";
import { registerController, registerCookieAuthentication$, registerDependencyManagement, registerJwtAuthentication$, registerRenderingEngine$ } from "./core/index.js";
import { IApplicationConfig } from "./config/interfaces/index.js";
import {
  AccountController,
  IndexController,
  UserApiController,
  AuthApiController,
  PlaceMarkApiController,
  CategoryApiController,
  PlaceMarkController,
  CategoryController,
} from "./controllers/index.js";
import { IContainer } from "./dependencies/interfaces/index.js";
import { UserController } from "./controllers/user-controller.js";

const filename: string = fileURLToPath(import.meta.url);
const dirname: string = path.dirname(filename);

const swaggerOptions: SwaggerOptions = {
  info: {
    title: "Place-Mark API",
    version: "0.1",
  },
  grouping: "tags",
  securityDefinitions: {
    jwt: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  security: [
    {
      jwt: [],
    },
  ],
};

/**
 * Creates and configures a new Hapi Server
 * @param config The Application config
 * @param containerFactory A function that creates the Container
 * @return { server: Server, start$: (log: true) => Promise<void> } The configured webserver and a function to start it
 */
export async function createServer$(config: IApplicationConfig, containerFactory: () => IContainer): Promise<{ server: Server; start$: () => Promise<void> }> {
  const server: Server = new Server({
    host: config.webServer.host,
    port: config.webServer.port,
    debug: { request: "*", log: "*" },
  });

  registerDependencyManagement(server, containerFactory);
  await registerRenderingEngine$(server, dirname);
  await registerCookieAuthentication$(server, config);
  await registerJwtAuthentication$(server, config);
  server.validator(Joi);
  await server.register(Inert);
  await server.register({
    plugin: HapiSwagger,
    options: swaggerOptions,
  });
  registerController(server, IndexController, () => new IndexController());
  registerController(server, AccountController, () => new AccountController());
  registerController(server, PlaceMarkController, () => new PlaceMarkController());
  registerController(server, CategoryController, () => new CategoryController());
  registerController(server, UserController, () => new UserController());

  registerController(server, AuthApiController, () => new AuthApiController());
  registerController(server, UserApiController, () => new UserApiController());
  registerController(server, PlaceMarkApiController, () => new PlaceMarkApiController());
  registerController(server, CategoryApiController, () => new CategoryApiController());

  return {
    server,

    start$: async (log = true) => {
      await server.start();
      if (log) {
        console.log("Server running on %s", server.info.uri);
      }
    },
  };
}

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});
