import Joi from "joi";
import { IPlaceMarkReadOnlyDto } from "../core/dtos/index.js";
import { createdAtSpec, designationSpec, idSpec, latitudeSpec, longitudeSpec, updatedAtSpec } from "./common.js";
import { lookupSpec } from "./lookup-spec.js";

export const placeMarkReadOnlySpec: Joi.ObjectSchema<IPlaceMarkReadOnlyDto> = Joi.object<IPlaceMarkReadOnlyDto>({
  id: idSpec,
  designation: designationSpec,
  description: Joi.string().required().label("Description").example("Tower Bridge").min(3).max(500),
  latitude: latitudeSpec,
  longitude: longitudeSpec,
  category: lookupSpec,
  createdBy: lookupSpec,
  createdAt: createdAtSpec,
  updatedAt: updatedAtSpec,
}).label("PlaceMarkReadOnlyDto");
