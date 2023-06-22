import Joi from "joi";
import { IUserReadOnlyDto } from "../core/dtos/index.js";
import { idSpec } from "./id-spec.js";

export const userReadOnlySpec: Joi.ObjectSchema<IUserReadOnlyDto> = Joi.object<IUserReadOnlyDto>({
  id: idSpec,
  firstName: Joi.string().required().description("First name of a user"),
  lastName: Joi.string().required().description("Last name of a user"),
  email: Joi.string().email().required().description("Email of a user"),
  admin: Joi.boolean().required().description("Value indicating whether a user is an admin"),
  createdAt: Joi.date().required().description("The entry creation time"),
  updatedAt: Joi.date().required().description("The last entry modification time"),
}).label("UserReadOnlyDto");
