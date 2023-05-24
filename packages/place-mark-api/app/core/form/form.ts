import { ValidationErrorItem } from "joi";
import { FormDefinition } from "./abstraction/index.js";
import { createFormField, IFormField } from "./form-field.js";
import { groupBy } from "../utils/index.js";
import { KeyOf } from "../types.js";

export interface IForm<T extends object> {
  action: string;
  method: string;
  fields: { [x in KeyOf<T>]: IFormField };
}

function createFormInternal<T extends object>(formDef: FormDefinition<T>, data: T | null, success: boolean, errors: ValidationErrorItem[] | null = null): IForm<T> {
  const errorsGrouped = groupBy(errors || [], (x) => x.path[0]);
  const result: IForm<T> = {
    action: formDef.action,
    method: formDef.method,
    fields: (Object.keys(formDef.fields) as Extract<keyof T, string>[]).reduce((rv, x) => {
      const value = data && x in data ? data[x] : null;
      const formFieldErrors = errorsGrouped[x] ? errorsGrouped[x] : [];
      rv[x] = createFormField(
        formDef.fields[x],
        success,
        formFieldErrors.map((y) => y.message),
        formDef.fields[x].type !== "password" ? value : null
      );
      return rv;
    }, {} as { [x in KeyOf<T>]: IFormField }),
  };

  return result;
}

export function createForm<T extends object>(formDef: FormDefinition<T>): IForm<T> {
  return createFormInternal(formDef, null, false, null);
}

export function createFailedForm<T extends object>(formDef: FormDefinition<T>, data: T, errors: ValidationErrorItem[]): IForm<T> {
  return createFormInternal(formDef, data, true, errors);
}
