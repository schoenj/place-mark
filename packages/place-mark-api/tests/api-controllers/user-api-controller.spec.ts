import { Server, ServerApplicationState } from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import axios, { AxiosResponse, AxiosError } from "axios";
import { assert } from "chai";
import { createServer$ } from "../../app/server.js";
import { Container, getConfig, IPaginatedListResponse, IUserReadOnlyDto } from "../../app/core/index.js";
import { QueryParams } from "../utils.js";

function pad(num: number, size: number) {
  let result = num.toString();
  while (result.length < size) result = `0${result}`;
  return result;
}

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

  suite("GET /api/user Tests", () => {
    teardown(async () => {
      await prismaClient.user.deleteMany();
    });

    test("should work", async () => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 26; i++) {
        // eslint-disable-next-line no-await-in-loop
        await prismaClient.user.create({
          data: {
            firstName: pad(i, 2),
            lastName: `${i}`,
            email: `${i}@test.com`,
            admin: false,
            password: "1234qwer",
          },
        });
      }

      const sendRequest$ = async (params?: QueryParams) => {
        const requestResponse: AxiosResponse<IPaginatedListResponse<IUserReadOnlyDto>> = await axios.get(`${server.info.uri}/api/user`, {
          params: params,
        });

        return requestResponse;
      };

      let response = await sendRequest$();
      assert.equal(response.status, 200);
      assert.equal(response.data.total, 26);
      assert.equal(response.data.data.length, 25);
      const firstNames = response.data.data.sort((a, b) => (a.firstName > b.firstName ? 1 : -1)).map((x) => parseInt(x.firstName, 10));
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 25; i++) {
        assert.equal(firstNames[i], i);
      }

      response = await sendRequest$({ take: 1 });
      assert.equal(response.status, 200);
      assert.equal(response.data.total, 26);
      assert.equal(response.data.data.length, 1);
      let actual = response.data.data[0];
      assert.equal(actual.firstName, "00");
      assert.equal(actual.lastName, "0");
      assert.equal(actual.email, "0@test.com");
      assert.equal(actual.admin, false);

      response = await sendRequest$({ take: 1, skip: 1 });
      assert.equal(response.status, 200);
      assert.equal(response.data.total, 26);
      assert.equal(response.data.data.length, 1);
      // eslint-disable-next-line prefer-destructuring
      actual = response.data.data[0];
      assert.equal(actual.firstName, "01");
      assert.equal(actual.lastName, "1");
      assert.equal(actual.email, "1@test.com");
      assert.equal(actual.admin, false);
    });
  });

  suite("GET /api/user/{id} Tests", () => {
    teardown(async () => {
      await prismaClient.user.deleteMany();
    });

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
