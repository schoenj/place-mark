import Joi from "joi";
import { IPlaceMarkReadWriteDto } from "../core/dtos/index.js";
import { descriptionSpec, designationSpec, idSpec, latitudeSpec, longitudeSpec } from "./common.js";

export const placeMarkReadWriteSpec: Joi.ObjectSchema<IPlaceMarkReadWriteDto> = Joi.object({
    id: idSpec,
    designation: designationSpec,
    description: descriptionSpec,
    latitude: latitudeSpec,
    longitude: longitudeSpec,
    categoryId: idSpec
});