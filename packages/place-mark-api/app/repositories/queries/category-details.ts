import { Prisma } from "@prisma/client";
import { categoryReadOnlyQuery } from "./category-read-only.js";
import { placeMarkLookupQuery } from "./place-mark-lookup.js";
import { ICategoryDetailsDto } from "../../core/dtos/index.js";

const categoryDetailsSelect = {
  ...categoryReadOnlyQuery.select,
  placeMarks: {
    select: placeMarkLookupQuery.select,
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.CategorySelect;

export type CategoryDetailsSelectType = Prisma.CategoryGetPayload<{ select: typeof categoryDetailsSelect }>;

function categoryDetailsTransform(category: CategoryDetailsSelectType): ICategoryDetailsDto {
  return {
    ...categoryReadOnlyQuery.transform(category),
    placeMarks: category.placeMarks.map((x) => placeMarkLookupQuery.transform(x)),
  };
}

export const categoryDetailsQuery = { select: categoryDetailsSelect, transform: categoryDetailsTransform };
