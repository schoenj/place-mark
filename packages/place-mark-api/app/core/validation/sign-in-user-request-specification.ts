import { createSpec } from "./spec-generator.js";
import { signInFormDefinition } from "../form/index.js";

export const SignInUserRequestSpecification = createSpec(signInFormDefinition);
