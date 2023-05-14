import Hapi from "@hapi/hapi";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const init = async () => {
  const server = Hapi.server({
      port: 3000,
      host: 'localhost'
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();