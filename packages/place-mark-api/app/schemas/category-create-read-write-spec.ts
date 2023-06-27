import Joi from "joi";
import { ICategoryCreateReadWriteDto } from "@schoenj/place-mark-core";
import { designationSpec } from "./common.js";

export const categoryCreateReadWriteSpec: Joi.ObjectSchema<ICategoryCreateReadWriteDto> = Joi.object({
  designation: designationSpec,
});
