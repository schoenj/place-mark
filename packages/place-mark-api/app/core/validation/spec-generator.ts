import Joi, { StringSchema, AnySchema } from "joi";
import { KeyOf } from "../utils/types.js";
import { FormDefinition, IInputBase, ITextInput } from "../form/index.js";

type AdditionalValidator<T extends AnySchema> = (schema: T) => T;
export type StringValidator = AdditionalValidator<StringSchema<string>>;

export type AdditionalValidators<T extends object> = {
  [Property in KeyOf<T>]: T[Property] extends string ? StringValidator : AdditionalValidator<AnySchema>;
};

function createStringSpec(def: ITextInput | IInputBase, additionalValidator?: StringValidator): Joi.StringSchema<string> {
  let schema: Joi.StringSchema<string> = Joi.string();
  schema.label(def.description || def.name);

  if (def.type === "email") {
    schema = schema.email();
  }

  if ("min" in def && typeof def.min === "number" && Number.isInteger(def.min)) {
    schema = schema.min(def.min);
  }

  if ("max" in def && typeof def.max === "number" && Number.isInteger(def.max)) {
    schema = schema.max(def.max);
  }

  if (additionalValidator) {
    schema = additionalValidator(schema);
  }

  return schema;
}

export function createSpec<T extends object>(formDef: FormDefinition<T>, validators?: Partial<AdditionalValidators<T>>): Joi.ObjectSchema<T> {
  const properties: Extract<keyof T, string>[] = Object.keys(formDef.fields) as Extract<keyof T, string>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objectSchema: any = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const property of properties) {
    const def = formDef.fields[property];

    let schema: Joi.AnySchema<string>;
    if (def.type === "text" || def.type === "email" || def.type === "password") {
      schema = createStringSpec(def, validators ? (validators[property] as StringValidator | undefined) : undefined);
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
