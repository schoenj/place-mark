import { IInputBase, ITextInput } from "./abstraction/index.js";

export interface IFormField {
  success: boolean;
  error: boolean;
  errors: string[];
  name: string;
  description?: string;
  required: boolean;
  min?: number;
  max?: number;
  inputType: string;
  value: unknown;
  placeholder?: string;
}

export function createFormField(field: IInputBase | ITextInput, success: boolean, errors: string[] | null = null, value: unknown = null): IFormField {
  const hasErrors = errors && Array.isArray(errors) && errors.length;

  return {
    name: field.name,
    placeholder: field.placeholder,
    description: field.description,
    min: "min" in field ? field.min : undefined,
    max: "max" in field ? field.max : undefined,
    inputType: field.type,
    required: field.required,
    value: value,
    success: success && !hasErrors,
    error: hasErrors,
    errors: errors || [],
  } as IFormField;
}
