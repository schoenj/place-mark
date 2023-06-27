import Joi from "joi";
import { IAuthCredentials } from "../services/interfaces/index.js";

export const authCredentialsSpec: Joi.ObjectSchema<IAuthCredentials> = Joi.object<IAuthCredentials>({
  email: Joi.string().email().required().example("cookie.monster@sesame-street.com"),
  password: Joi.string().required().example("kA293&5HyAUt"),
}).label("AuthCredentialsDto");
