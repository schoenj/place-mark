import { Category, User } from "@prisma/client";
import { assert } from "chai";
import { IntegrationTestFixture } from "./integration-test-fixture.js";
import { ICategoryReadOnlyDto } from "../../../app/core/dtos/index.js";
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
});
