import { PrismaClient } from "@prisma/client";
import { createServer$ } from "./app/server.js";
import { IApplicationConfig } from "./app/config/interfaces/index.js";
import { getConfig } from "./app/config/index.js";
import { Container } from "./app/dependencies/index.js";

const config: IApplicationConfig = getConfig();
const prisma = new PrismaClient();
prisma
  .$connect()
  .then(() => createServer$(config, () => new Container(config, prisma)))
  .then(({ start$ }) => start$())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
