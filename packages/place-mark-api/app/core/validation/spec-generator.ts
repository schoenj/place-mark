import Joi, { AnySchema } from "joi";
import { KeyOf } from "../types.js";
import { FormDefinition } from "../form/index.js";

export type AdditionalValidators<T extends object> = {
  [Property in KeyOf<T>]: T[Property] extends { type: "text" | "email" | "password" }
    ? (schema: Joi.StringSchema<string>) => Joi.StringSchema<string>
    : (schema: AnySchema) => AnySchema;
};

export function createSpec<T extends object>(formDef: FormDefinition<T>, validators?: AdditionalValidators<T>): Joi.ObjectSchema<T> {
  const properties = Object.keys(formDef.fields) as Array<Extract<keyof T, string>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objectSchema: any = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const property of properties) {
    const def = formDef.fields[property];

    let schema: Joi.AnySchema<string>;
    if (def.type === "text" || def.type === "email" || def.type === "password") {
      schema = Joi.string();

      if (def.type === "email") {
        schema = (schema as Joi.StringSchema<string>).email();
      }

      if ("min" in def && typeof def.min === "number" && Number.isInteger(def.min)) {
        schema = (schema as Joi.StringSchema<string>).min(def.min);
      }

      if ("max" in def && typeof def.max === "number" && Number.isInteger(def.max)) {
        schema = (schema as Joi.StringSchema<string>).max(def.max);
      }

      if (validators && property in validators) {
        schema = validators[property](schema as Joi.StringSchema<string>);
      }
    } else {
      throw new Error("");
    }

    if (def.required) {
      schema = schema.required();
    }

    objectSchema[property] = schema;
  }

  return Joi.object(objectSchema);
}
