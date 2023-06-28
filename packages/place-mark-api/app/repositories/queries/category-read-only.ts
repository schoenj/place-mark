import { Prisma } from "@prisma/client";
import { ICategoryReadOnlyDto } from "../../core/dtos/index.js";
import { userLookupQuery } from "./user-lookup.js";

const categoryReadOnlySelect = {
  id: true,
  designation: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: userLookupQuery.select,
  },
} satisfies Prisma.CategorySelect;

export type CategoryReadOnlySelectType = Prisma.CategoryGetPayload<{ select: typeof categoryReadOnlySelect }>;

function categoryReadOnlyTransform(category: CategoryReadOnlySelectType): ICategoryReadOnlyDto {
  return {
    ...category,
    createdBy: userLookupQuery.transform(category.createdBy),
  };
}

export const categoryReadOnlyQuery = { select: categoryReadOnlySelect, transform: categoryReadOnlyTransform };
