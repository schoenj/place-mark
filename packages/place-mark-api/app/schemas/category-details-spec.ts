import Joi, { ObjectSchema, PartialSchemaMap } from "joi";
import { ICategoryDetailsDto } from "../core/dtos/index.js";
import { categoryReadOnlySpec } from "./category-read-only-spec.js";
import { placeMarkLookupSpec } from "./place-mark-lookup-spec.js";

export const categoryDetailsSpec: Joi.ObjectSchema<ICategoryDetailsDto> = (
  categoryReadOnlySpec.keys({
    placeMarks: Joi.array().items(placeMarkLookupSpec).label("PlaceMarkLookupArray"),
  } as PartialSchemaMap<ICategoryDetailsDto>) as ObjectSchema<ICategoryDetailsDto>
).label("CategoryDetailDto");
