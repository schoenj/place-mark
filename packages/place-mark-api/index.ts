import { PrismaClient } from "@prisma/client";
import { createServer$ } from "./app/server";
import { getConfig, IApplicationConfig } from "./app/core";

const config: IApplicationConfig = getConfig();
const prisma = new PrismaClient();
createServer$(prisma, config).then(({ start$ }) => start$());
