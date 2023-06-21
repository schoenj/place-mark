import Joi from "joi";
import { IAuthResultDto } from "../core/index.js";

export const authSuccessResultSpec: Joi.ObjectSchema<IAuthResultDto> = Joi.object<IAuthResultDto>({
  success: Joi.boolean().required().description("Value indicating whether the authentication were successfully").example(true),
  token: Joi.string().required().description("Bearer Token on success, otherwise undefined").example("eyJhbGciOi[...].eyJpZCI6Ij[...].QAd-vNMj2[...]"),
  message: Joi.string().required().description("A short informative message about the operation"),
}).label("AuthSuccessResultDto");

export const authFailedResultSpec: Joi.ObjectSchema<IAuthResultDto> = Joi.object<IAuthResultDto>({
  success: Joi.boolean().required().description("Value indicating whether the authentication were successfully").example(false),
  message: Joi.string().required().description("A short informative message about the operation"),
}).label("AuthFailedResultDto");
