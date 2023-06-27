import { Prisma } from "@prisma/client";

export const cookieMonsterUser: Prisma.UserCreateInput = {
  firstName: "Cookie",
  lastName: "Monster",
  email: "cookie.monster@sesame-street.de",
  password: "1234",
};

export const kermitTheFrogUser: Prisma.UserCreateInput = {
  firstName: "Kermit",
  lastName: "the Frog",
  email: "kermit.the-frog@the-muppets.com",
  password: "1234",
};

/**
 * A Testuser that will always be, when sorted, be the last entry
 */
export const testUser: Prisma.UserCreateInput = {
  firstName: "x",
  lastName: "y",
  email: "x@y.de",
  admin: false,
  password: "1234qwer",
};
