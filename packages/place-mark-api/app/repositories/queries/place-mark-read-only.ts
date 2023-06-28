import { Prisma } from "@prisma/client";
import { IPlaceMarkReadOnlyDto } from "../../core/dtos/index.js";
import { userLookupQuery } from "./user-lookup.js";
import { categoryLookupQuery } from "./category-lookup.js";

const placeMarkReadOnlySelect = {
  id: true,
  designation: true,
  description: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: categoryLookupQuery.select,
  },
  createdBy: {
    select: userLookupQuery.select,
  },
} satisfies Prisma.PlaceMarkSelect;

export type PlaceMarkReadOnlySelectType = Prisma.PlaceMarkGetPayload<{ select: typeof placeMarkReadOnlySelect }>;

function placeMarkReadOnlyTransform(placeMark: PlaceMarkReadOnlySelectType): IPlaceMarkReadOnlyDto {
  return {
    ...placeMark,
    category: categoryLookupQuery.transform(placeMark.category),
    createdBy: userLookupQuery.transform(placeMark.createdBy),
  };
}

export const placeMarkReadOnlyQuery = { select: placeMarkReadOnlySelect, transform: placeMarkReadOnlyTransform };
