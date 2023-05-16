import { Server } from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import path from "path";
import Joi from "joi";
import { IApplicationConfig, registerCookieAuthentication$, registerDependencyManagement, registerRenderingEngine$ } from "./core/index.js";
import { webRoutes } from "./web-routes.js";

const filename: string = fileURLToPath(import.meta.url);
const dirname: string = path.dirname(filename);

/**
 * Creates and configures a new Hapi Server
 * @param prisma The Prisma Client
 * @param config The Application config
 * @return { server: Server, start$: Promise<void> } The configured webserver and a function to start it
 */
export const createServer$ = async (prisma: PrismaClient, config: IApplicationConfig) => {
  const server: Server = new Server({
    host: config.webServer.host,
    port: config.webServer.port,
  });

  registerDependencyManagement(server, prisma);
  await registerRenderingEngine$(server, dirname);
  await registerCookieAuthentication$(server, config);
  server.validator(Joi);
  server.route(webRoutes);

  return {
    server,

    start$: async () => {
      await server.start();
      console.log("Server running on %s", server.info.uri);
    },
  };
};

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});
