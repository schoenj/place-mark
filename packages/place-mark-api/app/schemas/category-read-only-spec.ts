import Joi from "joi";
import { ICategoryReadOnlyDto } from "@schoenj/place-mark-core";
import { createdAtSpec, designationSpec, idSpec, updatedAtSpec } from "./common.js";
import { lookupSpec } from "./lookup-spec.js";

export const categoryReadOnlySpec: Joi.ObjectSchema<ICategoryReadOnlyDto> = Joi.object({
  id: idSpec,
  designation: designationSpec,
  createdBy: lookupSpec,
  createdAt: createdAtSpec,
  updatedAt: updatedAtSpec,
}).label("CategoryReadOnlyDto");
