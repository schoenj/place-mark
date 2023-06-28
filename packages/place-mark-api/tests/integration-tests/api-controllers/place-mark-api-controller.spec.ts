import { assert } from "chai";
import { Category, PlaceMark, User } from "@prisma/client";
import axios, { AxiosError, AxiosResponse } from "axios";
import { IPlaceMarkReadOnlyDto } from "../../../app/core/dtos/index.js";
import { IntegrationTestFixture } from "./integration-test-fixture.js";
import { cookieMonsterUser } from "../../fixtures.js";
import { pad } from "../../utils.js";

suite("PlaceMarkApiController Integration Tests", () => {
  let fixture: IntegrationTestFixture;
  let user: User;
  let category: Category;
  let cmp: (expected: PlaceMark, actual: IPlaceMarkReadOnlyDto) => void;

  setup(async () => {
    fixture = new IntegrationTestFixture();
    await fixture.start$();
    user = await fixture.createUser$(cookieMonsterUser);
    category = await fixture.prisma.category.create({
      data: {
        designation: "landscape",
        createdById: user.id,
      },
    });
    cmp = (expected, actual) => {
      assert.isNotNull(actual);
      assert.equal(actual.id, expected.id);
      assert.equal(actual.designation, expected.designation);
      assert.equal(actual.description, expected.description);
      assert.equal(actual.latitude, expected.latitude);
      assert.equal(actual.longitude, expected.longitude);
      assert.isNotNull(actual.createdBy);
      assert.equal(actual.createdBy.id, user.id);
      assert.equal(actual.createdBy.designation, `${user.firstName} ${user.lastName}`);
      actual.createdAt = new Date(actual.createdAt);
      actual.updatedAt = new Date(actual.updatedAt);
      assert.equal(actual.createdAt.toUTCString(), expected.createdAt.toUTCString());
      assert.equal(actual.updatedAt.toUTCString(), expected.updatedAt.toUTCString());
      assert.equal(actual.category.id, category.id);
      assert.equal(actual.category.designation, category.designation);
    };
  });

  teardown(async () => {
    await fixture.stop$();
  });

  test("POST /api/place-mark should work", async () => {
    const payload = {
      designation: "Tower Bridge",
      description: "Part of the City of London",
      latitude: 51.5055,
      longitude: -0.075406,
      categoryId: category.id,
    };

    // Authentication should work
    try {
      await fixture.axios.post("/api/place-mark", payload);
    } catch (err) {
      assert.isTrue(axios.isAxiosError(err));
      const axiosError = err as AxiosError;
      assert.isNotNull(axiosError);
      assert.equal(axiosError.response?.status, 401);
    }

    // Success
    const token = await fixture.authenticate$(user);
    const response: AxiosResponse<IPlaceMarkReadOnlyDto> = await fixture.axios.post("/api/place-mark", payload, { headers: { Authorization: token } });
    assert.equal(response.status, 201);
    assert.isNotNull(response.data);
    const placeMark = await fixture.prisma.placeMark.findUnique({ where: { id: response.data.id } });
    assert.isNotNull(placeMark);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    cmp(placeMark!, response.data);
    assert.isNotEmpty(response.headers.location);
    assert.equal(response.headers.location, `/api/place-mark/${response.data.id}`);
  });

  test("GET /api/place-mark should work", async () => {
    const placeMarks: PlaceMark[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 26; i++) {
      // eslint-disable-next-line no-await-in-loop
      const placeMark = await fixture.prisma.placeMark.create({
        data: {
          designation: pad(i, 2),
          description: `desc ${pad(i, 2)}`,
          latitude: i,
          longitude: i,
          createdById: user.id,
          categoryId: category.id,
        },
      });
      placeMarks.push(placeMark);
    }

    await fixture.testGet$(placeMarks, "place-mark", cmp, (a, b) => (a.designation > b.designation ? 1 : -1));
  });

  test("GET /api/place-mark/{id} should work", async () => {
    await fixture.testGetById$(
      () =>
        fixture.prisma.placeMark.create({
          data: {
            designation: "Tower Bridge",
            description: "240m tall",
            latitude: 51.5055,
            longitude: -0.075406,
            createdById: user.id,
            categoryId: category.id,
          },
        }),
      "place-mark",
      cmp
    );
  });

  test("Delete /api/place-mark/{id} should work", async () => {
    await fixture.testDeleteById$(
      () => fixture.prisma.placeMark.create({
        data: {
        designation: "Tower Bridge",
        description: "240m tall",
        latitude: 51.5055,
        longitude: -0.075406,
        createdById: user.id,
        categoryId: category.id,
        }
      }),
      "place-mark",
      (id) => fixture.prisma.placeMark.findMany({ where: { id: id } })
    );
  });
});
