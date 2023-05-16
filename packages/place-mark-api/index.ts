import { createServer$ } from "./server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
createServer$(prisma).then(({ start$ }) => start$());
