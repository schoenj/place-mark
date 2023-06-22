import { PrismaClient } from "@prisma/client";
import { Server, ServerApplicationState } from "@hapi/hapi";
import axios from "axios";
import { assert } from "chai";
import { getConfig } from "../../../app/config/index.js";
import { createServer$ } from "../../../app/server.js";
import { Container } from "../../../app/dependencies/index.js";

suite("Swagger Documentation Integration Tests", () => {
  let prismaClient: PrismaClient;
  let server: Server<ServerApplicationState>;

  setup(async () => {
    prismaClient = new PrismaClient();
    const config = getConfig();
    const result = await createServer$(config, () => new Container(config, prismaClient));
    server = result.server;
    await result.start$(false);
  });

  teardown(async () => {
    await server.stop({ timeout: 1 });
    await prismaClient.$disconnect();
  });

  test("GET /swagger.json should be fetchable", async () => {
    const result = await axios.get(`${server.info.uri}/swagger.json`);
    assert.equal(result.status, 200);
    assert.isObject(result.data);
  });
});
