import axios, { AxiosResponse, AxiosError } from "axios";
import { assert } from "chai";
import { User } from "@prisma/client";
import { IPaginatedListResponse, IPlaceMarkReadOnlyDto } from "../../../app/core/dtos/index.js";
import { IntegrationTestFixture } from "./integration-test-fixture.js";
import { cookieMonsterUser } from "../../fixtures.js";
import { pad, QueryParams } from "../../utils.js";

suite("PlaceMarkApiController Integration Tests", () => {
  let fixture: IntegrationTestFixture;
  let token: string;
  let user: User;

  setup(async () => {
    fixture = new IntegrationTestFixture();
    await fixture.start$();
    token = fixture.authValidator.add({ id: "some-id", email: "admin@admin.com", admin: false });
    user = await fixture.createUser$(cookieMonsterUser);
  });

  teardown(async () => {
    await fixture.stop$();
  });

  suite("GET /api/place-mark Tests", () => {
    test("should work", async () => {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 26; i++) {
        // eslint-disable-next-line no-await-in-loop
        await fixture.prisma.placeMark.create({
          data: {
            designation: pad(i, 2),
            description: `desc ${pad(i, 2)}`,
            latitude: i,
            longitude: i,
            createdById: user.id,
          },
        });
      }

      const sendRequest$ = async (params?: QueryParams) => {
        const requestResponse: AxiosResponse<IPaginatedListResponse<IPlaceMarkReadOnlyDto>> = await fixture.axios.get("/api/place-mark", {
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
      const firstNames = response.data.data.sort((a, b) => (a.designation > b.designation ? 1 : -1)).map((x) => parseInt(x.designation, 10));
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 25; i++) {
        assert.equal(firstNames[i], i);
      }

      response = await sendRequest$({ take: 1 });
      assert.equal(response.status, 200);
      assert.equal(response.data.total, 26);
      assert.equal(response.data.data.length, 1);
      let actual = response.data.data[0];
      assert.equal(actual.designation, "00");
      assert.equal(actual.description, "desc 00");
      assert.equal(actual.latitude, 0);
      assert.equal(actual.longitude, 0);

      response = await sendRequest$({ take: 1, skip: 1 });
      assert.equal(response.status, 200);
      assert.equal(response.data.total, 26);
      assert.equal(response.data.data.length, 1);
      // eslint-disable-next-line prefer-destructuring
      actual = response.data.data[0];
      assert.equal(actual.designation, "01");
      assert.equal(actual.description, "desc 01");
      assert.equal(actual.latitude, 1);
      assert.equal(actual.longitude, 1);
    });
  });

  suite("GET /api/place-mark/{id} Tests", () => {
    test("should return 404", async () => {
      try {
        await fixture.axios.get("/api/place-mark/646634e51d85e59154d725c5", { headers: { Authorization: token } });
      } catch (err) {
        assert.isTrue(axios.isAxiosError(err));
        const axiosError = err as AxiosError;
        assert.isNotNull(axiosError);
        assert.equal(axiosError.response?.status, 404);
      }
    });

    test("should work", async () => {
      const placeMark = await fixture.prisma.placeMark.create({
        data: {
          designation: "Tower Bridge",
          description: "240m tall",
          latitude: 51.5055,
          longitude: -0.075406,
          createdById: user.id,
        },
      });

      const response: AxiosResponse<IPlaceMarkReadOnlyDto> = await fixture.axios.get(`/api/place-mark/${placeMark.id}`, { headers: { Authorization: token } });
      assert.equal(response.status, 200);
      assert.isNotNull(response.data);
      assert.equal(response.data.id, placeMark.id);
      assert.equal(response.data.designation, placeMark.designation);
      assert.equal(response.data.description, placeMark.description);
      assert.equal(response.data.latitude, placeMark.latitude);
      assert.equal(response.data.longitude, placeMark.longitude);
      assert.isNotNull(response.data.createdBy);
      assert.equal(response.data.createdBy.id, user.id);
      assert.equal(response.data.createdBy.designation, `${user.firstName} ${user.lastName}`);
      response.data.createdAt = new Date(response.data.createdAt);
      response.data.updatedAt = new Date(response.data.updatedAt);
      assert.equal(response.data.createdAt.toUTCString(), placeMark.createdAt.toUTCString());
      assert.equal(response.data.updatedAt.toUTCString(), placeMark.updatedAt.toUTCString());
    });
  });
});
