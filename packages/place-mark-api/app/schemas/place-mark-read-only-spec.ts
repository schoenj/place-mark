import Joi from "joi";
import { IPlaceMarkReadOnlyDto } from "../core/dtos/index.js";
import { createdAtSpec, designationSpec, idSpec, updatedAtSpec } from "./common.js";
import { lookupSpec } from "./lookup-spec.js";

export const placeMarkReadOnlySpec: Joi.ObjectSchema<IPlaceMarkReadOnlyDto> = Joi.object<IPlaceMarkReadOnlyDto>({
  id: idSpec,
  designation: designationSpec,
  description: Joi.string().required().label("Description").example("Tower Bridge").min(3).max(500),
  latitude: Joi.number().required().min(-90).max(90).label("Latitude").example(51.5055),
  longitude: Joi.number().required().min(-180).max(180).label("Longitude").example(-0.075406),
  createdBy: lookupSpec,
  createdAt: createdAtSpec,
  updatedAt: updatedAtSpec,
}).label("PlaceMarkReadOnlyDto");
