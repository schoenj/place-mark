import { KeyOf } from "../../types.js";
import { IInputBase, ITextInput } from "./form-input-definitions.js";

export interface FormDefinition<T extends object> {
  action: string;
  method: "GET" | "POST";
  fields: { [x in KeyOf<T>]: IInputBase | ITextInput };
}
