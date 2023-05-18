import { ITextInput } from "./abstraction/index.js";

export const firstNameInputFieldDef: ITextInput = {
  type: "text",
  required: true,
  name: "firstName",
  description: "First name",
  placeholder: "Enter first name",
  min: 3,
  max: 30,
};

export const lastNameInputFieldDef: ITextInput = {
  type: "text",
  required: true,
  name: "lastName",
  description: "Last name",
  placeholder: "Enter last name",
  min: 3,
  max: 30,
};

export const emailInputFieldDef: ITextInput = {
  type: "email",
  required: true,
  name: "email",
  description: "Email",
  placeholder: "Enter email",
  min: 3,
  max: 50,
};

export const passwordInputFieldDef: ITextInput = {
  type: "password",
  required: true,
  name: "Password",
  description: "Password",
  placeholder: "Enter password",
};

export const passwordAgainInputFieldDef: ITextInput = {
  ...passwordInputFieldDef,
  name: "Password again",
  description: "Password again",
  placeholder: "Enter password again",
};
