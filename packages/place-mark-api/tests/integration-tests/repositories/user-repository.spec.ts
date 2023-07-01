import { Prisma, User } from "@prisma/client";
import { assert } from "chai";
import { cookieMonsterUser, kermitTheFrogUser } from "../../fixtures.js";
import { UserRepository } from "../../../app/repositories/index.js";
import { RepositoryTestFixture } from "./repository-test-fixture.js";
import { IUserReadOnlyDto } from "../../../app/core/dtos/index.js";

suite("UserRepository Integration Tests", () => {
  let fixture: RepositoryTestFixture<UserRepository>;
  let cmp: (expected: User, actual: IUserReadOnlyDto) => void;

  setup(async () => {
    fixture = new RepositoryTestFixture<UserRepository>((client) => new UserRepository(client));
    await fixture.start$();
    cmp = (expected, actual) => {
      assert.isNotNull(actual);
      assert.equal(actual.id, expected.id);
      assert.equal(actual.firstName, expected.firstName);
      assert.equal(actual.lastName, expected.lastName);
      assert.equal(actual.email, expected.email);
      assert.equal(actual.admin, expected.admin);
      assert.equal(actual.createdAt.toUTCString(), expected.createdAt.toUTCString());
      assert.equal(actual.updatedAt.toUTCString(), expected.updatedAt.toUTCString());
      assert.isEmpty(Object.keys(actual).filter((x) => x === "password"));
    };
  });

  teardown(async () => {
    await fixture.stop$();
  });

  test("get$ should work", async () => {
    const users: User[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 5; i > 0; i--) {
      // eslint-disable-next-line no-await-in-loop
      const user = await fixture.prisma.user.create({
        data: {
          firstName: `Firstname ${i}`,
          lastName: `Lastname ${i}`,
          email: `firstname-${i}@test.com`,
          password: `password-${i}`,
        },
      });
      users.push(user);
    }

    await fixture.testPaginate$(
      (repository, skip, take) => repository.get$({ take, skip }),
      users,
      cmp,
      (a, b) => (a.firstName > b.firstName ? 1 : -1)
    );
  });

  test("getByEmail$ should work", async () => {
    await fixture.createUser$(cookieMonsterUser);
    await fixture.createUser$(kermitTheFrogUser);

    // Cookie Monster should be found
    let found = await fixture.repository.getByEmail$(cookieMonsterUser.email);
    assert.isNotNull(found);
    assert.equal(found?.email, cookieMonsterUser.email);

    // Cookie Monster should be found, the email address should be case-insensitive
    found = await fixture.repository.getByEmail$("coOkIE.MoNsTeR@SESAME-street.de");
    assert.isNotNull(found);
    assert.equal(found?.email, cookieMonsterUser.email);

    // Kermit the Frog should be found
    found = await fixture.repository.getByEmail$(kermitTheFrogUser.email);
    assert.isNotNull(found);
    assert.equal(found?.email, kermitTheFrogUser.email);

    // Miss Piggy should not be found
    found = await fixture.repository.getByEmail$("miss.piggy@the-muppets.com");
    assert.isNull(found);
  });

  test("getById$ should work", async () => {
    await fixture.testGetById$(
      () => fixture.prisma.user.create({ data: cookieMonsterUser }),
      (repo, id) => repo.getById$(id),
      cmp
    );
  });

  test("create$ should work", async () => {
    const user = await fixture.repository.create$(cookieMonsterUser);
    assert.isNotNull(user);
    assert.isNotNull(user?.id);
    assert.equal(user?.firstName, cookieMonsterUser.firstName);
    assert.equal(user?.lastName, cookieMonsterUser.lastName);
    assert.equal(user?.email, cookieMonsterUser.email);
    assert.equal(user?.password, cookieMonsterUser.password);

    try {
      await fixture.repository.create$(cookieMonsterUser);
      assert.fail("Should throw a exception");
    } catch (ex) {
      assert.instanceOf(ex, Prisma.PrismaClientKnownRequestError);
      const prismaEx = ex as Prisma.PrismaClientKnownRequestError;
      assert.equal(prismaEx.code, "P2002");
      assert.isNotNull(prismaEx.meta);
      assert.equal(prismaEx.meta?.target, "User_email_key");
    }
  });

  test("deleteById$ should work", async() => {
    await fixture.testDeleteById$(
      () => fixture.prisma.user.create({ data: cookieMonsterUser }),
      (repo, id) => repo.deleteById$(id),
      async (id) => {
        const found = await fixture.prisma.user.count({ where: { id: id}});
        return !!found;
      }
    );
  });
});
