import Joi from "joi";

export const idSpec: Joi.StringSchema<string> = Joi.string().required().label("ID").description("a valid ID");

export const designationSpec: Joi.StringSchema<string> = Joi.string().required().label("Designation").max(100);

export const descriptionSpec: Joi.StringSchema<string> = Joi.string().optional().label("Description").max(500);

export const createdAtSpec: Joi.DateSchema = Joi.date().required().description("The entry creation time");

export const updatedAtSpec: Joi.DateSchema = Joi.date().required().description("The last entry modification time");

export const latitudeSpec: Joi.NumberSchema = Joi.number().required().min(-90).max(90).label("Latitude").example(51.5055);

export const longitudeSpec: Joi.NumberSchema = Joi.number().required().min(-180).max(180).label("Longitude").example(-0.075406);
