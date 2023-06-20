import Joi from "joi";
import { IValidationResult } from "../core/index.js";
import { validationResultItemSpec } from "./validation-result-item-spec.js";

export const validationResultSpec: Joi.ArraySchema<IValidationResult[]> = Joi.array().items(validationResultItemSpec).label("ValidationResult");
