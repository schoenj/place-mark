import { FormDefinition } from "../abstraction/index.js";
import { ISignInUserRequestDto } from "../../dtos/index.js";
import { emailInputFieldDef, passwordInputFieldDef } from "../common-definitions.js";

export const signInFormDefinition: FormDefinition<ISignInUserRequestDto> = {
  action: "/account/sign-in",
  method: "POST",
  fields: {
    email: emailInputFieldDef,
    password: passwordInputFieldDef,
  },
};
