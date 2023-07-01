import { Prisma } from "@prisma/client";
import { IPlaceMarkLookupDto } from "../../core/dtos/index.js";

const placeMarkLookupSelect = {
  id: true,
  designation: true,
  latitude: true,
  longitude: true,
} satisfies Prisma.PlaceMarkSelect;

export type PlaceMarkLookupSelectType = Prisma.PlaceMarkGetPayload<{ select: typeof placeMarkLookupSelect }>;

function placeMarkLookupTransform(placeMark: PlaceMarkLookupSelectType): IPlaceMarkLookupDto {
  return placeMark;
}

export const placeMarkLookupQuery = { select: placeMarkLookupSelect, transform: placeMarkLookupTransform };
