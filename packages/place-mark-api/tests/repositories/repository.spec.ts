import { PrismaClient, User } from "@prisma/client";
import { assert } from "chai";
import { Repository } from "../../app/core/repositories/repository.js";
import { userReadOnlyQuery } from "../../app/core/repositories/queries/user-read-only.js";

class TestRepository extends Repository {
  public testPaginate$ = this.paginate$;
}

suite("Repository Tests", () => {
  let prismaClient: PrismaClient;
  let repository: TestRepository;

  setup(async () => {
    prismaClient = new PrismaClient();
    await prismaClient.$connect();
    repository = new TestRepository(prismaClient);
  });

  teardown(async () => {
    await prismaClient.$disconnect();
  });

  suite("paginate$ should work", () => {
    let users: User[];

    setup(async () => {
      users = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 5; i > 0; i--) {
        // eslint-disable-next-line no-await-in-loop
        const user = await prismaClient.user.create({
          data: {
            firstName: `Firstname ${i}`,
            lastName: `Lastname ${i}`,
            email: `firstname-${i}@test.com`,
            password: `password-${i}`,
          },
        });
        users.push(user);
      }
    });

    teardown(async () => {
      await prismaClient.user.deleteMany();
    });
    const userPaginate$ = (skip: number, take: number) =>
      repository.testPaginate$("user", undefined, { firstName: "asc" }, userReadOnlyQuery.select, userReadOnlyQuery.transform, skip, take);

    test("skip should work", async () => {
      let result = await userPaginate$(0, 5);
      assert.isNotNull(result);
      assert.equal(result.total, users.length);
      assert.equal(result.data.length, 5);

      result = await userPaginate$(4, 5);
      assert.isNotNull(result);
      assert.equal(result.total, users.length);
      assert.equal(result.data.length, 1);

      result = await userPaginate$(9999, 5);
      assert.isNotNull(result);
      assert.equal(result.total, users.length);
      assert.equal(result.data.length, 0);
    });

    test("take should work", async () => {
      let result = await userPaginate$(0, 5);
      assert.equal(result.total, users.length);
      assert.equal(result.data.length, 5);

      result = await userPaginate$(0, 4);
      assert.equal(result.total, users.length);
      assert.equal(result.data.length, 4);

      result = await userPaginate$(0, 1);
      assert.equal(result.total, users.length);
      assert.equal(result.data.length, 1);

      result = await userPaginate$(0, 999);
      assert.equal(result.total, users.length);
      assert.equal(result.data.length, 5);
    });

    test("order should work", async () => {
      let result = await userPaginate$(0, 0);
      assert.isNotNull(result);
      let firstNames = result.data.map((x) => x.firstName);
      assert.equal(firstNames[0], "Firstname 1");
      assert.equal(firstNames[1], "Firstname 2");
      assert.equal(firstNames[2], "Firstname 3");
      assert.equal(firstNames[3], "Firstname 4");
      assert.equal(firstNames[4], "Firstname 5");

      result = await userPaginate$(2, 5);
      firstNames = result.data.map((x) => x.firstName);
      assert.isNotNull(result);
      assert.equal(firstNames[0], "Firstname 3");
      assert.equal(firstNames[1], "Firstname 4");
      assert.equal(firstNames[2], "Firstname 5");
    });

    test("select should work", async () => {
      const result = await userPaginate$(0, 1);
      assert.isNotNull(result);
      const actual = result.data[0];
      assert.isNotNull(actual);

      const expected = users.find((x) => x.id === result.data[0].id);
      assert.isNotNull(expected);

      assert.equal(actual.firstName, expected?.firstName);
      assert.equal(actual.lastName, expected?.lastName);
      assert.equal(actual.email, expected?.email);
      assert.equal(Object.keys(actual).filter((x) => x === "password").length, 0);
      assert.equal(actual?.updatedAt.toUTCString(), expected?.updatedAt.toUTCString());
      assert.equal(actual?.createdAt.toUTCString(), expected?.createdAt.toUTCString());
    });
  });
});
