import { PrismaClient } from "@prisma/client";
import { createServer$ } from "./server";

const prisma = new PrismaClient();
createServer$(prisma).then(({ start$ }) => start$());
