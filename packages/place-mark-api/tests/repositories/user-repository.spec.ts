import { PrismaClient, User } from "@prisma/client";
import { assert } from "chai";
import { UserRepository } from "../../app/core/index.js";

const createCookieMonster$ = async (client: PrismaClient) => {
  const user: User = await client.user.create({
    data: {
      firstName: "Cookie",
      lastName: "Monster",
      email: "cookie.monster@sesame-street.de",
      password: "1234",
    },
  });
  return [user.id, user.email];
};

suite("UserRepository Integration Tests", () => {
  let prismaClient: PrismaClient;
  let repository: UserRepository;

  setup(async () => {
    prismaClient = new PrismaClient();
    await prismaClient.$connect();
    repository = new UserRepository(prismaClient);
  });

  teardown(async () => {
    await prismaClient.user.deleteMany();
    await prismaClient.$disconnect();
  });

  test("getByEmail$ should work", async () => {
    const [, cookieMonsterMail] = await createCookieMonster$(prismaClient);

    const kermitTheFrogMail = "kermit.the-frog@the-muppets.com";
    await prismaClient.user.create({
      data: {
        firstName: "Kermit",
        lastName: "the Frog",
        email: "kermit.the-frog@the-muppets.com",
        password: "1234",
      },
    });

    // Cookie Monster should be found
    let found = await repository.getByEmail$(cookieMonsterMail);
    assert.isNotNull(found);
    assert.equal(cookieMonsterMail, found?.email);

    // Cookie Monster should be found, the email address should be case-insensitive
    found = await repository.getByEmail$("coOkIE.MoNsTeR@SESAME-street.de");
    assert.isNotNull(found);
    assert.equal(cookieMonsterMail, found?.email);

    // Kermit the Frog should be found
    found = await repository.getByEmail$(kermitTheFrogMail);
    assert.isNotNull(found);
    assert.equal(kermitTheFrogMail, found?.email);

    // Miss Piggy should not be found
    found = await repository.getByEmail$("miss.piggy@the-muppets.com");
    assert.isNull(found);
  });

  test("getById$ should work", async () => {
    const [userId] = await createCookieMonster$(prismaClient);
    const user = await repository.getById$(userId);
    assert.isNotNull(user);
    assert.equal(userId, user?.id);
    assert.equal("Cookie", user?.firstName);
    assert.equal("Monster", user?.lastName);
    assert.equal("cookie.monster@sesame-street.de", user?.email);
    assert.equal("1234", user?.password);
  });

  test("create$ should work", async () => {
    const [userId, cookieMonsterMail] = await createCookieMonster$(prismaClient);
    const user = await prismaClient.user.findUnique({
      where: {
        email: cookieMonsterMail,
      },
    });

    assert.isNotNull(user);
    assert.equal(userId, user?.id);
    assert.equal("Cookie", user?.firstName);
    assert.equal("Monster", user?.lastName);
    assert.equal("cookie.monster@sesame-street.de", user?.email);
    assert.equal("1234", user?.password);

    await assert.isRejected(createCookieMonster$(prismaClient));
  });
});
