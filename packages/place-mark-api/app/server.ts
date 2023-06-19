import { Server } from "@hapi/hapi";
import { fileURLToPath } from "url";
import path from "path";
import Joi from "joi";
import Inert from "@hapi/inert";
import HapiSwagger from "hapi-swagger";
import { IApplicationConfig, IContainer, registerCookieAuthentication$, registerDependencyManagement, registerRenderingEngine$ } from "./core/index.js";
import { registerController } from "./core/endpoints/utils.js";
import { AccountController, IndexController, UserApiController } from "./controllers/index.js";

const filename: string = fileURLToPath(import.meta.url);
const dirname: string = path.dirname(filename);

const swaggerOptions = {
  info: {
    title: "Place-Mark API",
    version: "0.1",
  },
  // securityDefinitions: {
  //   jwt: {
  //     type: "apiKey",
  //     name: "Authorization",
  //     in: "header",
  //   },
  // },
  // security: [{ jwt: [] }],
};

/**
 * Creates and configures a new Hapi Server
 * @param config The Application config
 * @param containerFactory A function that creates the Container
 * @return { server: Server, start$: (log: true) => Promise<void> } The configured webserver and a function to start it
 */
export const createServer$ = async (config: IApplicationConfig, containerFactory: () => IContainer) => {
  const server: Server = new Server({
    host: config.webServer.host,
    port: config.webServer.port,
    debug: { request: "*" },
  });

  registerDependencyManagement(server, containerFactory);
  await registerRenderingEngine$(server, dirname);
  await registerCookieAuthentication$(server, config);
  server.validator(Joi);
  await server.register(Inert);
  await server.register({
    plugin: HapiSwagger,
    options: swaggerOptions,
  });
  registerController(server, IndexController, () => new IndexController());
  registerController(server, AccountController, () => new AccountController());
  registerController(server, UserApiController, () => new UserApiController());

  return {
    server,

    start$: async (log = true) => {
      await server.start();
      if (log) {
        console.log("Server running on %s", server.info.uri);
      }
    },
  };
};

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});
