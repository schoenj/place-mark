import { Prisma } from "@prisma/client";
import { userLookupQuery } from "./user-lookup.js";
import { IPlaceMarkReadOnlyDto } from "../../core/dtos/index.js";

const placeMarkReadOnlySelect = {
  id: true,
  designation: true,
  description: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: userLookupQuery.select,
  },
} satisfies Prisma.PlaceMarkSelect;

export type PlaceMarkReadOnlySelectType = Prisma.PlaceMarkGetPayload<{ select: typeof placeMarkReadOnlySelect }>;

function placeMarkReadOnlyTransform(placeMark: PlaceMarkReadOnlySelectType): IPlaceMarkReadOnlyDto {
  return {
    ...placeMark,
    createdBy: userLookupQuery.transform(placeMark.createdBy),
  };
}

export const placeMarkReadOnlyQuery = { select: placeMarkReadOnlySelect, transform: placeMarkReadOnlyTransform };
