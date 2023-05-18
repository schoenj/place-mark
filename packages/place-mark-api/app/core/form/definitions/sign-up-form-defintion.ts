import { FormDefinition } from "../abstraction/index.js";
import { ISignUpUserRequestDto } from "../../dtos/index.js";
import { emailInputFieldDef, firstNameInputFieldDef, lastNameInputFieldDef, passwordAgainInputFieldDef, passwordInputFieldDef } from "../common-definitions.js";

export const signUpFormDefinition: FormDefinition<ISignUpUserRequestDto> = {
  action: "/account/sign-up",
  method: "POST",
  fields: {
    firstName: firstNameInputFieldDef,
    lastName: lastNameInputFieldDef,
    email: emailInputFieldDef,
    password: passwordInputFieldDef,
    passwordAgain: passwordAgainInputFieldDef,
  },
};
