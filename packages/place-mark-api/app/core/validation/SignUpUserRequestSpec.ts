import Joi from "joi";
import { ISignUpUserRequestDto } from "../dtos/index.js";

export const SignUpUserRequestSpec: Joi.ObjectSchema<ISignUpUserRequestDto> = Joi.object<ISignUpUserRequestDto>({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  passwordAgain: Joi.string().required(),
});
