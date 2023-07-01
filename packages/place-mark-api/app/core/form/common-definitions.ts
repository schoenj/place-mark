import { INumberInput, ISelectInput, ITextInput } from "./abstraction/index.js";

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
  name: "password",
  description: "Password",
  placeholder: "Enter password",
};

export const passwordAgainInputFieldDef: ITextInput = {
  ...passwordInputFieldDef,
  name: "passwordAgain",
  description: "Password again",
  placeholder: "Enter password again",
};

export const designationInputFieldDef: ITextInput = {
  type: "text",
  required: true,
  name: "designation",
  placeholder: "Designation",
  description: "Designation",
  min: 3,
  max: 100,
};

export const descriptionInputFieldDef: ITextInput = {
  type: "text",
  max: 500,
  name: "description",
  placeholder: "A short description ...",
  description: "Description",
};

export const latitudeInputFieldDef: INumberInput = {
  type: "number",
  name: "latitude",
  description: "Latitude",
  min: -90,
  max: +90,
  step: ".0000001",
};

export const longitudeInputFieldDef: INumberInput = {
  type: "number",
  name: "longitude",
  description: "Longitude",
  min: -180,
  max: 180,
  step: ".0000001",
};

export const categoryInputFieldDef: ISelectInput = {
  type: "select",
  name: "categoryId",
  description: "Category",
  valueType: "string",
  options: async (container) => {
    const categories = await container.categoryRepository.getLookup$();
    return categories.map((x) => ({ value: x.id, designation: x.designation }));
  },
};
