import axios, { AxiosResponse, AxiosError } from "axios";
import { assert } from "chai";
import { IPaginatedListResponse, IUserReadOnlyDto } from "../../../app/core/dtos/index.js";
import { pad, QueryParams } from "../../utils.js";
import { kermitTheFrogUser } from "../../fixtures.js";
import { IntegrationTestFixture } from "./integration-test-fixture.js";

suite("UserApiController Integration Tests", () => {
  let fixture: IntegrationTestFixture;
  let token: string;

  setup(async () => {
    fixture = new IntegrationTestFixture();
    await fixture.start$();
    token = fixture.authValidator.add({ id: "some-id", admin: false, email: "admin@admin.com" });
  });

  teardown(async () => {
    await fixture.stop$();
  });

  suite("GET /api/user Tests", () => {
    test("should work", async () => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 26; i++) {
        // eslint-disable-next-line no-await-in-loop
        await fixture.prisma.user.create({
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
        const requestResponse: AxiosResponse<IPaginatedListResponse<IUserReadOnlyDto>> = await fixture.axios.get("/api/user", {
          params: params,
          headers: {
            Authorization: token,
          },
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
    test("should return 404", async () => {
      try {
        await fixture.axios.get("/api/user/646634e51d85e59154d725c5", { headers: { Authorization: token } });
      } catch (err) {
        assert.isTrue(axios.isAxiosError(err));
        const axiosError = err as AxiosError;
        assert.isNotNull(axiosError);
        assert.equal(axiosError.response?.status, 404);
      }
    });

    test("should work", async () => {
      const user = await fixture.prisma.user.create({
        data: {
          firstName: "Cookie",
          lastName: "Monster",
          email: "cookie.monster@sesame-street.de",
          password: "1234qwer",
          admin: false,
        },
      });

      const response: AxiosResponse<IUserReadOnlyDto> = await fixture.axios.get(`/api/user/${user.id}`, { headers: { Authorization: token } });
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

  suite("DELETE /api/user/{id}", () => {
    test("Deleting a existing user should return 204", async () => {
      const user = await fixture.prisma.user.create({ data: kermitTheFrogUser });
      const response = await fixture.axios.delete(`/api/user/${user.id}`, { headers: { Authorization: token } });
      assert.equal(response.status, 204);

      const found = await fixture.prisma.user.findUnique({ where: { id: user.id } });
      assert.isNull(found);
    });

    test("Deleting a not existing user should return 204", async () => {
      const response = await fixture.axios.delete("/api/user/646634e51d85e59154d725c5", { headers: { Authorization: token } });
      assert.equal(response.status, 204);
    });
  });
});
