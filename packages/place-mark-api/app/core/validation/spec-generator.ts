import Joi, { StringSchema, AnySchema, NumberSchema } from "joi";
import { KeyOf, RequiredKeys } from "../utils/types.js";
import { FormDefinition, ICheckbox, IInputBase, INumberInput, ISelectInput, ISelectOption, ITextInput } from "../form/index.js";

type AdditionalValidator<T extends AnySchema> = (schema: T) => T;
export type StringValidator = AdditionalValidator<StringSchema<string>>;

export type AdditionalValidators<T extends object> = {
  [Property in KeyOf<T>]: T[Property] extends string ? StringValidator : AdditionalValidator<AnySchema>;
};

function createSelectSpec(def: ISelectInput | IInputBase): AnySchema {
  const valueType = "valueType" in def ? def.valueType : "string";
  let schema: AnySchema = valueType === "string" ? Joi.string() : Joi.number();

  if ("options" in def) {
    if (typeof def.options === "function") {
      // In this case we need to check separately
      return schema;
    }

    const values = (def.options as ISelectOption[]).map((x) => x.value);
    schema = schema.allow(values);
  }

  return schema;
}

function createCheckboxSpec(def: ICheckbox | IInputBase): AnySchema {
  if (!("value" in def)) {
    throw new Error("Checkbox Definition is not invalid!");
  }

  const schema = Joi.string().required().allow(def.value);
  return schema;
}

function setMinMax<T extends { min: (value: number) => T; max: (value: number) => T }>(schema: T, def: IInputBase): T {
  if ("min" in def && typeof def.min === "number" && Number.isInteger(def.min)) {
    schema = schema.min(def.min);
  }

  if ("max" in def && typeof def.max === "number" && Number.isInteger(def.max)) {
    schema = schema.max(def.max);
  }

  return schema;
}

function createNumberSpec(def: INumberInput | IInputBase, additionalValidator?: AdditionalValidator<NumberSchema>): Joi.NumberSchema {
  let schema: Joi.NumberSchema = Joi.number();
  schema = setMinMax(schema, def);
  if (additionalValidator) {
    schema = additionalValidator(schema);
  }

  return schema;
}

function createStringSpec(def: ITextInput | IInputBase, additionalValidator?: StringValidator): Joi.StringSchema {
  let schema: Joi.StringSchema<string> = Joi.string();
  schema.label(def.description || def.name);
  schema = setMinMax(schema, def);

  if (def.type === "email") {
    schema = schema.email();
  }

  if (additionalValidator) {
    schema = additionalValidator(schema);
  }

  return schema;
}

export function createSpec<T extends object>(formDef: FormDefinition<T>, validators?: Partial<AdditionalValidators<T>>): Joi.ObjectSchema<T> {
  const properties: RequiredKeys<T>[] = Object.keys(formDef.fields) as RequiredKeys<T>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objectSchema: any = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const property of properties) {
    if (!formDef.fields[property]) {
      // eslint-disable-next-line no-continue
      continue;
    }

    const def = formDef.fields[property];

    let schema: Joi.AnySchema;
    if (def.type === "text" || def.type === "email" || def.type === "password") {
      schema = createStringSpec(def, validators ? (validators[property] as StringValidator | undefined) : undefined);
    } else if (def.type === "number") {
      schema = createNumberSpec(def, validators ? (validators[property] as AdditionalValidator<NumberSchema> | undefined) : undefined);
    } else if (def.type === "select") {
      schema = createSelectSpec(def);
    } else if (def.type === "checkbox") {
      schema = createCheckboxSpec(def);
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
