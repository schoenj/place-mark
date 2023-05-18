import { createSpec } from "./spec-generator.js";
import { signUpFormDefinition } from "../form/index.js";

export const SignUpUserRequestSpecification = createSpec(signUpFormDefinition);
