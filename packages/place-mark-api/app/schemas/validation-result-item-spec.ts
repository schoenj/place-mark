import Joi from "joi";
import { IValidationResult } from "../core/index.js";

export const validationResultItemSpec: Joi.ObjectSchema<IValidationResult> = Joi.object({
  property: Joi.string().required().description("The path to an invalid property."),
  message: Joi.string().required().description("A description of the rule that were not matched."),
}).label("ValidationResultItem");
