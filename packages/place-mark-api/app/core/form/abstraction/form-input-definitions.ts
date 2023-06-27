export type InputTypes = "text" | "email" | "password";

export interface IInputBase {
  name: string;
  type: InputTypes;
  placeholder?: string;
  description?: string;
  required?: boolean;
}

export interface ITextInput extends IInputBase {
  type: "text" | "email" | "password";
  min?: number;
  max?: number;
}
