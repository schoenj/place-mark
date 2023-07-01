import { RequiredKeys } from "../../utils/types.js";
import { ICheckbox, IInputBase, INumberInput, ISelectInput, ITextInput } from "./form-input-definitions.js";

export interface FormDefinition<T extends object> {
  action: string;
  method: "GET" | "POST";
  fields: { [x in RequiredKeys<T>]: IInputBase | ITextInput | ISelectInput | INumberInput | ICheckbox };
}
