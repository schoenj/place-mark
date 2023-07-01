import { FormDefinition } from "../abstraction/index.js";
import { IUserUpdatePasswordRequestDto } from "../../dtos/index.js";
import { passwordAgainInputFieldDef, passwordInputFieldDef } from "../common-definitions.js";

export const userUpdatePasswordFormDefinition: FormDefinition<IUserUpdatePasswordRequestDto> = {
  action: "/account/password",
  method: "POST",
  fields: {
    oldPassword: {
      ...passwordInputFieldDef,
      name: "oldPassword",
      description: "Old Password",
      placeholder: "Enter old Password",
    },
    password: passwordInputFieldDef,
    passwordAgain: passwordAgainInputFieldDef,
  },
};
