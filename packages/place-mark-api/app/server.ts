import { Server } from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import { IApplicationConfig, registerDependencyManagement } from "./core";

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
