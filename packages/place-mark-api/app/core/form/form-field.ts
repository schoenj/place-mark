import { IInputBase, ISelectOption, ITextInput } from "./abstraction/index.js";

export interface IFormField {
  success: boolean;
  error: boolean;
  errors: string[];
  name: string;
  options?: ISelectOption[];
  description?: string;
  required: boolean;
  min?: number;
  max?: number;
  inputType: string;
  value: unknown;
  placeholder?: string;
  step?: string;
}

export function createFormField(field: IInputBase | ITextInput, success: boolean, errors: string[] | null = null, value: unknown = null): IFormField {
  const hasErrors = errors && Array.isArray(errors) && errors.length;

  return {
    name: field.name,
    placeholder: "placeholder" in field ? field.placeholder : undefined,
    description: field.description,
    min: "min" in field ? field.min : undefined,
    max: "max" in field ? field.max : undefined,
    inputType: field.type,
    options:
      "options" in field
        ? (field.options as ISelectOption[])?.map(
            (x) =>
              ({
                value: x.value.toString(),
                designation: x.designation,
                selected: value ? value === x.value : x.selected,
              } as ISelectOption)
          )
        : undefined,
    required: field.required,
    value: "value" in field ? field.value : value,
    success: success && !hasErrors,
    error: hasErrors,
    errors: errors || [],
    step: "step" in field ? field.step : undefined,
  } as IFormField;
}
