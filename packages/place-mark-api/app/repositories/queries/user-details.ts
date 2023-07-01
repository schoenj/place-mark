import { Prisma } from "@prisma/client";
import { userReadOnlyQuery } from "./user-read-only.js";
import { categoryLookupQuery } from "./category-lookup.js";
import { placeMarkLookupQuery } from "./place-mark-lookup.js";
import { IUserDetailsDto } from "../../core/dtos/index.js";

const userDetailsSelect = {
  ...userReadOnlyQuery.select,
  categories: {
    select: categoryLookupQuery.select,
  },
  placeMarks: {
    select: placeMarkLookupQuery.select,
  },
} satisfies Prisma.UserSelect;

export type UserDetailsSelectType = Prisma.UserGetPayload<{ select: typeof userDetailsSelect }>;

function userDetailsTransform(user: UserDetailsSelectType): IUserDetailsDto {
  return {
    ...userReadOnlyQuery.transform(user),
    categories: user.categories.map((x) => categoryLookupQuery.transform(x)),
    placeMarks: user.placeMarks.map((x) => placeMarkLookupQuery.transform(x)),
  };
}

export const userDetailsQuery = { select: userDetailsSelect, transform: userDetailsTransform };
