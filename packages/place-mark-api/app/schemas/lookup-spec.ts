import Joi from "joi";
import { ILookupDto } from "../core/dtos/index.js";
import { designationSpec, idSpec } from "./common.js";

export const lookupSpec: Joi.ObjectSchema<ILookupDto> = Joi.object<ILookupDto>({
  id: idSpec,
  designation: designationSpec,
}).label("LookupDto");
