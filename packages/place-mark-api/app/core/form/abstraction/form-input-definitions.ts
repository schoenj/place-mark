import { IContainer } from "../../../dependencies/interfaces/index.js";

export type InputTypes = "text" | "email" | "password" | "select" | "number" | "checkbox";

export interface IInputBase {
  name: string;
  type: InputTypes;
  description?: string;
  required?: boolean;
}

export interface ITextInput extends IInputBase {
  type: "text" | "email" | "password";
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface ISelectOption {
  designation: string;
  value: string;
  selected?: boolean;
}

export type SelectOptionsLoader = (container: IContainer) => Promise<ISelectOption[]>;

export interface ISelectInput extends IInputBase {
  type: "select";
  selected?: string;
  options: ISelectOption[] | SelectOptionsLoader;
  valueType: "number" | "string";
}

export interface INumberInput extends IInputBase {
  type: "number";
  min?: number;
  max?: number;
  step?: string;
}

export interface ICheckbox extends IInputBase {
  type: "checkbox";
  value: string;
}
