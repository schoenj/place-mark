import Joi from "joi";
import { IPlaceMarkCreateReadWriteDto } from "@schoenj/place-mark-core";
import { descriptionSpec, designationSpec, idSpec, latitudeSpec, longitudeSpec } from "./common.js";

export const placeMarkCreateReadWriteSpec: Joi.ObjectSchema<IPlaceMarkCreateReadWriteDto> = Joi.object<IPlaceMarkCreateReadWriteDto>({
  designation: designationSpec,
  description: descriptionSpec,
  latitude: latitudeSpec,
  longitude: longitudeSpec,
  categoryId: idSpec,
});
