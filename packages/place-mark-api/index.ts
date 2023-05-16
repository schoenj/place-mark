import { PrismaClient } from "@prisma/client";
import { createServer$ } from "./app/server.js";
import { getConfig, IApplicationConfig } from "./app/core/index.js";

const config: IApplicationConfig = getConfig();
const prisma = new PrismaClient();
createServer$(prisma, config).then(({ start$ }) => start$());
