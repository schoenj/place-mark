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
