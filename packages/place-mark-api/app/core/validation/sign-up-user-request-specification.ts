import Joi, { StringSchema, ValidationOptions } from "joi";
import { createSpec } from "./spec-generator.js";
import { signUpFormDefinition } from "../form/index.js";

export const SignUpUserRequestSpecification = createSpec(signUpFormDefinition, {
  passwordAgain: (schema: StringSchema<string>) =>
    schema
      .required()
      .valid(Joi.ref("password"))
      .options({ messages: { any: "Passwords must match" } } as ValidationOptions),
});
