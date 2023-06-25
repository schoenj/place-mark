import Joi from "joi";

export const idSpec: Joi.StringSchema<string> = Joi.string().required().label("ID").description("a valid ID");

export const designationSpec: Joi.StringSchema<string> = Joi.string().required().label("Designation").max(100);

export const createdAtSpec: Joi.DateSchema = Joi.date().required().description("The entry creation time");

export const updatedAtSpec: Joi.DateSchema = Joi.date().required().description("The last entry modification time");
