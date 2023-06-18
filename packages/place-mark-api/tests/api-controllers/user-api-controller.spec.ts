import { Server, ServerApplicationState } from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import axios, { AxiosResponse, AxiosError } from "axios";
import { assert } from "chai";
import { createServer$ } from "../../app/server.js";
import { Container, getConfig, IUserReadOnlyDto } from "../../app/core/index.js";

suite("UserApiController Integration Tests", () => {
  let prismaClient: PrismaClient;
  let server: Server<ServerApplicationState>;

  setup(async () => {
    prismaClient = new PrismaClient();
    await prismaClient.$connect();
    const result = await createServer$(getConfig(), () => new Container(prismaClient));
    server = result.server;
    await result.start$(false);
  });

  teardown(async () => {
    await prismaClient.user.deleteMany();
    await server.stop({ timeout: 1 });
    await prismaClient.$disconnect();
  });

  suite("GET /api/user/{id} Tests", () => {
    test("should return 404", async () => {
      try {
        await axios.get(`${server.info.uri}/api/user/646634e51d85e59154d725c5`);
      } catch (err) {
        assert.isTrue(axios.isAxiosError(err));
        const axiosError = err as AxiosError;
        assert.isNotNull(axiosError);
        assert.equal(axiosError.response?.status, 404);
      }
    });

    test("should work", async () => {
      const user = await prismaClient.user.create({
        data: {
          firstName: "Cookie",
          lastName: "Monster",
          email: "cookie.monster@sesame-street.de",
          password: "1234qwer",
          admin: false,
        },
      });

      const response: AxiosResponse<IUserReadOnlyDto> = await axios.get(`${server.info.uri}/api/user/${user.id}`);
      assert.equal(response.status, 200);
      assert.isNotNull(response.data);
      assert.equal(response.data.id, user.id);
      assert.equal(response.data.firstName, user.firstName);
      assert.equal(response.data.lastName, user.lastName);
      assert.equal(response.data.email, user.email);
      assert.equal(response.data.admin, user.admin);
      response.data.createdAt = new Date(response.data.createdAt);
      response.data.updatedAt = new Date(response.data.updatedAt);
      assert.equal(response.data.createdAt.toUTCString(), user.createdAt.toUTCString());
      assert.equal(response.data.updatedAt.toUTCString(), user.updatedAt.toUTCString());
    });
  });
});
