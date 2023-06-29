import Joi from "joi";
import { ICategoryReadWriteDto } from "../core/dtos/index.js";
import { designationSpec, idSpec } from "./common.js";

export const categoryReadWriteSpec: Joi.ObjectSchema<ICategoryReadWriteDto> = Joi.object({
  id: idSpec,
  designation: designationSpec,
}).label("CategoryReadWriteDto");
