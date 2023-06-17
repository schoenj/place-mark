import { Prisma } from "@prisma/client";
import { IUserReadOnlyDto } from "../../dtos/index.js";

const userReadOnlySelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  admin: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserReadOnlySelectType = Prisma.UserGetPayload<{ select: typeof userReadOnlySelect }>;

function userReadOnlyTransform(user: UserReadOnlySelectType): IUserReadOnlyDto {
  return user;
}

export const userReadOnlyQuery = { select: userReadOnlySelect, transform: userReadOnlyTransform };
