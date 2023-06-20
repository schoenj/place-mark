import { ResponseObject } from "@hapi/hapi";
import { Controller, Route } from "../../core/index.js";
import { IAuthCredentials } from "../../services/interfaces/index.js";
import { defaultFailAction } from "./utils.js";
import { authCredentialsSpec, authFailedResultSpec, authSuccessResultSpec } from "../../schemas/index.js";

export class AuthApiController extends Controller {
  @Route({
    method: "POST",
    path: "/api/auth/token",
    options: {
      auth: false,
      tags: ["api"],
      description: "Authenticates a user",
      validate: {
        payload: authCredentialsSpec,
        failAction: defaultFailAction,
      },
      response: {
        status: {
          200: authSuccessResultSpec,
          401: authFailedResultSpec,
        },
      },
    },
  })
  public async authenticate$(): Promise<ResponseObject> {
    const credentials = this.request.payload as IAuthCredentials;
    const result = await this.container.authService.authenticate$(credentials);
    if (!result.success) {
      return this.h.response({ success: false, message: "Invalid credentials" }).code(401);
    }

    const token = this.container.authService.createToken(result.user);
    return this.h.response({ success: true, token, message: "Successfully authenticated" }).code(200);
  }
}
