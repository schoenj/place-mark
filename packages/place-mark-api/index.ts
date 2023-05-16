import { PrismaClient } from "@prisma/client";
import { createServer$ } from "./server";
import { getConfig, IApplicationConfig } from "./core";

const config: IApplicationConfig = getConfig();
const prisma = new PrismaClient();
createServer$(prisma, config).then(({ start$ }) => start$());
