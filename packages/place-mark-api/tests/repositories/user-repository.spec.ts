import { PrismaClient, User, Prisma } from "@prisma/client";
import { assert } from "chai";
import { UserRepository } from "../../app/core/index.js";
import { cookieMonsterUser, kermitTheFrogUser } from "./fixtures.js";

const createUser$ = async (client: PrismaClient, userData: Prisma.UserCreateInput) => {
  const user: User = await client.user.create({ data: userData });
  return [user.id, user.email];
};

suite("UserRepository Integration Tests", () => {
  let prismaClient: PrismaClient;
  let repository: UserRepository;
  let cookieMonsterId: string;
  let cookieMonsterEmail: string;

  setup(async () => {
    prismaClient = new PrismaClient();
    await prismaClient.$connect();
    repository = new UserRepository(prismaClient);
    [cookieMonsterId, cookieMonsterEmail] = await createUser$(prismaClient, cookieMonsterUser);
  });

  teardown(async () => {
    await prismaClient.user.deleteMany();
    await prismaClient.$disconnect();
  });

  test("getByEmail$ should work", async () => {
    await createUser$(prismaClient, kermitTheFrogUser);

    // Cookie Monster should be found
    let found = await repository.getByEmail$(cookieMonsterEmail);
    assert.isNotNull(found);
    assert.equal(cookieMonsterEmail, found?.email);

    // Cookie Monster should be found, the email address should be case-insensitive
    found = await repository.getByEmail$("coOkIE.MoNsTeR@SESAME-street.de");
    assert.isNotNull(found);
    assert.equal(cookieMonsterEmail, found?.email);

    // Kermit the Frog should be found
    found = await repository.getByEmail$(kermitTheFrogUser.email);
    assert.isNotNull(found);
    assert.equal(kermitTheFrogUser.email, found?.email);

    // Miss Piggy should not be found
    found = await repository.getByEmail$("miss.piggy@the-muppets.com");
    assert.isNull(found);
  });

  test("getById$ should work", async () => {
    const user = await repository.getById$(cookieMonsterId);
    assert.isNotNull(user);
    assert.equal(user?.id, cookieMonsterId);
    assert.equal(user?.firstName, cookieMonsterUser.firstName);
    assert.equal(user?.lastName, cookieMonsterUser.lastName);
    assert.equal(user?.email, cookieMonsterUser.email);
  });

  test("create$ should work", async () => {
    const user = await prismaClient.user.findUnique({
      where: {
        email: cookieMonsterUser.email,
      },
    });

    assert.isNotNull(user);
    assert.equal(user?.id, cookieMonsterId);
    assert.equal(user?.firstName, cookieMonsterUser.firstName);
    assert.equal(user?.lastName, cookieMonsterUser.lastName);
    assert.equal(user?.email, cookieMonsterUser.email);
    assert.equal(user?.password, cookieMonsterUser.password);

    await assert.isRejected(createUser$(prismaClient, cookieMonsterUser));
  });
});
