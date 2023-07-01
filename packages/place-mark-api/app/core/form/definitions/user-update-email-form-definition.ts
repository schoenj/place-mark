import { FormDefinition } from "../abstraction/index.js";
import { IUserUpdateEmailRequestDto } from "../../dtos/index.js";
import { emailInputFieldDef } from "../common-definitions.js";

export const userUpdateEmailFormDefinition: FormDefinition<IUserUpdateEmailRequestDto> = {
  action: "/account/email",
  method: "POST",
  fields: {
    email: emailInputFieldDef,
  },
};
