import { Prisma } from "@prisma/client";
import { ILookupDto } from "../../core/dtos/index.js";

const categoryLookupSelect = {
  id: true,
  designation: true,
} satisfies Prisma.CategorySelect;

export type CategoryLookupSelectType = Prisma.CategoryGetPayload<{ select: typeof categoryLookupSelect }>;

function categoryLookupTransform(category: CategoryLookupSelectType): ILookupDto {
  return { id: category.id, designation: category.designation };
}

export const categoryLookupQuery = {
  select: categoryLookupSelect,
  transform: categoryLookupTransform,
};
