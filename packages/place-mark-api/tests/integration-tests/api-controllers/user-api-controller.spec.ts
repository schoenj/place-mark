import { assert } from "chai";
import { User } from "@prisma/client";
import { IUserReadOnlyDto } from "../../../app/core/dtos/index.js";
import { pad } from "../../utils.js";
import { kermitTheFrogUser } from "../../fixtures.js";
import { IntegrationTestFixture } from "./integration-test-fixture.js";

suite("UserApiController Integration Tests", () => {
  let fixture: IntegrationTestFixture;
  let cmp: (expected: User, actual: IUserReadOnlyDto) => void;

  setup(async () => {
    fixture = new IntegrationTestFixture();
    await fixture.start$();
    cmp = (expected, actual) => {
      assert.equal(actual.id, expected.id);
      assert.equal(actual.firstName, expected.firstName);
      assert.equal(actual.lastName, expected.lastName);
      assert.equal(actual.email, expected.email);
      assert.equal(actual.admin, expected.admin);
      actual.createdAt = new Date(actual.createdAt);
      actual.updatedAt = new Date(actual.updatedAt);
      assert.equal(actual.createdAt.toUTCString(), expected.createdAt.toUTCString());
      assert.equal(actual.updatedAt.toUTCString(), expected.updatedAt.toUTCString());
    };
  });

  teardown(async () => {
    await fixture.stop$();
  });

  test("GET /api/user should work", async () => {
    const users: User[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 26; i++) {
      // eslint-disable-next-line no-await-in-loop
      const user = await fixture.prisma.user.create({
        data: {
          firstName: pad(i, 2),
          lastName: `${i}`,
          email: `${i}@test.com`,
          admin: false,
          password: "1234qwer",
        },
      });
      users.push(user);
    }

    await fixture.testGet$(users, "user", cmp, (a, b) => (a.firstName > b.firstName ? 1 : -1));
  });

  test("GET /api/user/{id} should work", async () => {
    await fixture.testGetById$<User, IUserReadOnlyDto>(
      () =>
        fixture.prisma.user.create({
          data: {
            firstName: "Cookie",
            lastName: "Monster",
            email: "cookie.monster@sesame-street.de",
            password: "1234qwer",
            admin: false,
          },
        }),
      "user",
      cmp
    );
  });

  test("Delete /api/user/{id} should work", async () => {
    await fixture.testDeleteById$(
      () => fixture.prisma.user.create({ data: kermitTheFrogUser }),
      "user",
      (id) => fixture.prisma.user.findMany({ where: { id: id } })
    );
  });
});
