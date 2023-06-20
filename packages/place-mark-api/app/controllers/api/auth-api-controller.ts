import { ResponseObject } from "@hapi/hapi";
import Joi from "joi";
import { Controller, Route } from "../../core/index.js";
import { IAuthCredentials } from "../../services/interfaces/index.js";
import { defaultFailAction } from "./utils.js";

export interface IApiAuthenticationResultDto {
  success: boolean;
  token?: string;
  message: string;
}

export class AuthApiController extends Controller {
  @Route({
    method: "POST",
    path: "/api/auth/token",
    options: {
      auth: false,
      tags: ["api"],
      description: "Authenticates a user",
      validate: {
        payload: Joi.object<IAuthCredentials>({
          email: Joi.string().email().required(),
          password: Joi.string().required(),
        }).label("AuthCredentials"),
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: Joi.object({
            success: Joi.boolean().required().example(true),
            message: Joi.string().required().example("Successfully authenticated"),
            token: Joi.string().required().example(""),
          }),
          403: Joi.object({
            success: Joi.boolean().required().example(false),
            message: Joi.string().required().example("Invalid credentials"),
            token: Joi.string().optional().example(""),
          }),
        },
      },
    },
  })
  public async authenticate$(): Promise<ResponseObject> {
    const credentials = this.request.payload as IAuthCredentials;
    const result = await this.request.container.authService.authenticate$(credentials);
    if (!result.success) {
      return this.response.response({ success: false, message: "Invalid credentials" }).code(403);
    }

    const token = this.request.container.authService.createToken(result.user);
    return this.response.response({ success: true, token, message: "Successfully authenticated" }).code(200);
  }
}
