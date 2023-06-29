import { ValidationErrorItem } from "joi";
import { FormDefinition, IInputBase, ISelectInput, SelectOptionsLoader } from "./abstraction/index.js";
import { createFormField, IFormField } from "./form-field.js";
import { groupBy } from "../utils/index.js";
import { KeyOf } from "../utils/types.js";
import { IContainer } from "../../dependencies/interfaces/index.js";

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

export async function createForm$<T extends object>(formDef: FormDefinition<T>, container: IContainer): Promise<IForm<T>> {
  // eslint-disable-next-line no-restricted-syntax
  for (const fieldName of Object.keys(formDef.fields) as KeyOf<T>[]) {
    const field = formDef.fields[fieldName] as IInputBase;
    if (field.type === "select") {
      const selectField = field as ISelectInput;
      if (typeof selectField.options === "function") {
        // eslint-disable-next-line no-await-in-loop
        selectField.options = await (selectField.options as SelectOptionsLoader)(container);
      }
    }
  }

  return createForm(formDef);
}

export function createFailedForm<T extends object>(formDef: FormDefinition<T>, data: T, errors: ValidationErrorItem[]): IForm<T> {
  return createFormInternal(formDef, data, true, errors);
}
