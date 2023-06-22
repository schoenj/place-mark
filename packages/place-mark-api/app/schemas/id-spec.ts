import Joi from "joi";

export const idSpec: Joi.StringSchema<string> = Joi.string().required().label("ID").description("a valid ID");

export const idParamSpec = Joi.object({ id: idSpec }).label("IdParams");
