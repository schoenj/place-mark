import { Prisma } from "@prisma/client";
import { ILookupDto } from "../../core/dtos/index.js";

const userLookupSelect = {
  id: true,
  firstName: true,
  lastName: true,
} satisfies Prisma.UserSelect;

export type UserLookupSelectType = Prisma.UserGetPayload<{ select: typeof userLookupSelect }>;

function userLookupTransform(user: UserLookupSelectType): ILookupDto {
  return {
    id: user.id,
    designation: `${user.firstName} ${user.lastName}`,
  };
}

export const userLookupQuery = { select: userLookupSelect, transform: userLookupTransform };
