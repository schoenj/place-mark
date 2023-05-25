import { PrismaClient } from "@prisma/client";
import { createServer$ } from "./app/server.js";
import { Container, getConfig, IApplicationConfig } from "./app/core/index.js";

const config: IApplicationConfig = getConfig();
const prisma = new PrismaClient();
createServer$(config, () => new Container(prisma)).then(({ start$ }) => start$());
