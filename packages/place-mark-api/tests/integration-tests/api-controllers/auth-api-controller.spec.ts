import { PrismaClient } from "@prisma/client";
import { Server, ServerApplicationState } from "@hapi/hapi";
import axios, { AxiosError, AxiosResponse, isAxiosError } from "axios";
import { assert } from "chai";
import jwt from "jsonwebtoken";
import { getConfig } from "../../../app/config/index.js";
import { createServer$ } from "../../../app/server.js";
import { Container } from "../../../app/dependencies/index.js";
import { kermitTheFrogUser } from "../../fixtures.js";
import { IAuthResultDto } from "../../../app/core/dtos/index.js";

suite("AuthApiController Integration Tests", () => {
  let prismaClient: PrismaClient;
  let server: Server<ServerApplicationState>;

  setup(async () => {
    prismaClient = new PrismaClient();
    await prismaClient.$connect();
    const config = getConfig();
    const result = await createServer$(config, () => new Container(config, prismaClient));
    server = result.server;
    await result.start$(false);
  });

  teardown(async () => {
    await prismaClient.user.deleteMany();
    await server.stop({ timeout: 1 });
    await prismaClient.$disconnect();
  });

  suite("POST /api/auth/token Tests", () => {
    test("should return 403 if password does not match or user is not found", async () => {
      const validateError = (ex: unknown) => {
        assert.isTrue(isAxiosError(ex));
        const axiosError = ex as AxiosError<IAuthResultDto>;
        assert.equal(axiosError.response?.status, 401);
        assert.isFalse(axiosError.response?.data.success);
        assert.equal(axiosError.response?.data.message, "Invalid credentials");
        assert.isUndefined(axiosError.response?.data.token);
      };

      try {
        await axios.post(`${server.info.uri}/api/auth/token`, { email: kermitTheFrogUser.email, password: kermitTheFrogUser.password });
        assert.fail("Axios should throw exception");
      } catch (ex) {
        validateError(ex);
      }

      const user = await prismaClient.user.create({ data: kermitTheFrogUser });
      try {
        await axios.post(`${server.info.uri}/api/auth/token`, { email: user.email, password: "something different" });
        assert.fail("Axios should throw exception");
      } catch (ex) {
        validateError(ex);
      }
    });

    test("should work", async () => {
      const user = await prismaClient.user.create({ data: kermitTheFrogUser });
      const response: AxiosResponse<IAuthResultDto> = await axios.post(`${server.info.uri}/api/auth/token`, { email: user.email, password: user.password });
      assert.equal(response.status, 200);
      assert.isTrue(response.data.success);
      assert.equal(response.data.message, "Successfully authenticated");
      assert.isNotNull(response.data.token);
      const decoded = jwt.verify(response.data.token || "", getConfig().jwt.password);
      assert.isObject(decoded);
    });
  });
});
