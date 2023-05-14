import {Server} from "@hapi/hapi";
import { PrismaClient } from '@prisma/client';
import {registerDependencyManagement} from "./core";

/**
 * Creates and configures a new Hapi Server
 * @param prisma The Prisma Client
 */
export const createServer$ = async (prisma: PrismaClient) => {
  const server: Server = new Server({
      port: 3000,
      host: 'localhost'
  });

  registerDependencyManagement(server, prisma);

  return {
      server,

      start$: async () => {
          await server.start();
          console.log('Server running on %s', server.info.uri);
      }
  };
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});