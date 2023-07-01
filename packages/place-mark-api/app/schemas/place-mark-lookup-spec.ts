import Joi, { PartialSchemaMap } from "joi";
import { IPlaceMarkLookupDto } from "../core/dtos/index.js";
import { lookupSpec } from "./lookup-spec.js";
import { latitudeSpec, longitudeSpec } from "./common.js";

export const placeMarkLookupSpec: Joi.ObjectSchema<IPlaceMarkLookupDto> = (
  lookupSpec.keys({
    latitude: latitudeSpec,
    longitude: longitudeSpec,
  } as PartialSchemaMap<IPlaceMarkLookupDto>) as Joi.ObjectSchema<IPlaceMarkLookupDto>
).label("PlaceMarkLookup");
