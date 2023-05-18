import Joi from "joi";
import { ISignUpUserRequestDto } from "../dtos/index.js";
import { createSpec } from "./spec-generator.js";
import { signUpFormDefinition } from "../form/index.js";

export const SignUpUserRequestSpec: Joi.ObjectSchema<ISignUpUserRequestDto> = createSpec(signUpFormDefinition);
