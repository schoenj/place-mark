import { Category, User } from "@prisma/client";
import { assert } from "chai";
import axios, { AxiosError, AxiosResponse } from "axios";
import { IntegrationTestFixture } from "./integration-test-fixture.js";
import {ICategoryReadOnlyDto, ICategoryReadWriteDto} from "../../../app/core/dtos/index.js";
import { cookieMonsterUser } from "../../fixtures.js";
import { pad } from "../../utils.js";

suite("CategoryApiController Integration Tests", () => {
  let fixture: IntegrationTestFixture;
  let user: User;
  let cmp: (expected: Category, actual: ICategoryReadOnlyDto) => void;

  setup(async () => {
    fixture = new IntegrationTestFixture();
    await fixture.start$();
    user = await fixture.createUser$(cookieMonsterUser);
    cmp = (expected, actual) => {
      assert.isNotNull(actual);
      assert.equal(actual.id, expected.id);
      assert.equal(actual.designation, expected.designation);
      assert.isNotNull(actual.createdBy);
      assert.equal(actual.createdBy.id, user.id);
      assert.equal(actual.createdBy.designation, `${user.firstName} ${user.lastName}`);
      actual.createdAt = new Date(actual.createdAt);
      actual.updatedAt = new Date(actual.updatedAt);
      assert.equal(actual.createdAt.toUTCString(), expected.createdAt.toUTCString());
      assert.equal(actual.updatedAt.toUTCString(), expected.updatedAt.toUTCString());
    };
  });

  teardown(async () => {
    await fixture.stop$();
  });

  test("POST /api/category should work", async () => {
    // Authentication should work
    try {
      await fixture.axios.post("/api/category", { designation: "Bridge" });
    } catch (err) {
      assert.isTrue(axios.isAxiosError(err));
      const axiosError = err as AxiosError;
      assert.isNotNull(axiosError);
      assert.equal(axiosError.response?.status, 401);
    }

    // Success
    const token = await fixture.authenticate$(user);
    const response: AxiosResponse<ICategoryReadOnlyDto> = await fixture.axios.post(
      "/api/category",
      {
        designation: "Bridge",
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
    assert.equal(response.status, 201);
    assert.isNotNull(response.data);
    const category = await fixture.prisma.category.findUnique({ where: { id: response.data.id } });
    assert.isNotNull(category);
    assert.equal(response.data.designation, "Bridge");
    assert.isNotNull(response.data.createdBy);
    assert.equal(response.data.createdBy.id, user.id);
    assert.equal(response.data.createdBy.designation, `${user.firstName} ${user.lastName}`);
    assert.isNotNull(response.data.createdAt);
    assert.isNotNull(response.data.updatedAt);
    assert.isNotEmpty(response.headers.location);
    assert.equal(response.headers.location, `/api/category/${response.data.id}`);
  });

  test("GET /api/category should work", async () => {
    const categories: Category[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 26; i++) {
      // eslint-disable-next-line no-await-in-loop
      const category = await fixture.prisma.category.create({
        data: {
          designation: pad(i, 2),
          createdById: user.id,
        },
      });
      categories.push(category);
    }

    await fixture.testGet$(categories, "category", cmp, (a, b) => (a.designation > b.designation ? 1 : -1));
  });

  test("GET /api/category/{id} should work", async () => {
    await fixture.testGetById$(() => fixture.prisma.category.create({ data: { designation: "Tower Bridge", createdById: user.id } }), "category", cmp);
  });

  test("PUT /api/category should work", async() => {
    await fixture.testUpdate$(
        "category",
        () => fixture.prisma.category.create({
          data: {
            designation: "Bridge",
            createdById: user.id
          }
        }),
        { designation: "New Bridge" } as ICategoryReadWriteDto,
        async id => (await fixture.prisma.category.findUnique({ where: { id: id }})) as Category,
        (created, updated, dto) => {
          assert.equal(updated.id, created.id);
          assert.equal(updated.createdById, created.createdById);
          assert.equal(updated.createdAt.toUTCString(), updated.createdAt.toUTCString());
          assert.equal(updated.designation, dto.designation);
        },
        (updated, result: ICategoryReadOnlyDto) => {
          assert.equal(result.id, updated.id);
          result.updatedAt = new Date(result.updatedAt);
          assert.equal(result.updatedAt.toUTCString(), updated.updatedAt.toUTCString());
          assert.isNotNull(result.createdBy);
          assert.equal(result.createdBy.id, updated.createdById);
          assert.equal(result.createdBy.designation, `${user.firstName} ${user.lastName}`);
          assert.equal(result.designation, updated.designation);
        }
    );
  });

  test("Delete /api/category/{id} should work", async () => {
    await fixture.testDeleteById$(
      () => fixture.prisma.category.create({
        data: {
          designation: "Bridge",
          createdById: user.id,
        }
      }),
      "category",
      (id) => fixture.prisma.category.findMany({ where: { id: id } })
    );
  });
});
