import Joi from "joi";
import { ICategoryCreateReadWriteDto } from "../core/dtos/index.js";
import { designationSpec } from "./common.js";

export const categoryCreateReadWriteSpec: Joi.ObjectSchema<ICategoryCreateReadWriteDto> = Joi.object({
  designation: designationSpec,
}).label("CategoryCreateReadWriteDto");
