import { Request, ResponseToolkit } from "@hapi/hapi";
import { ValidationError, ValidationErrorItem } from "joi";
import { EndpointDef, ISignUpUserRequestDto, SignUpUserRequestSpecification } from "../core/index.js";

export const accountController = {
  showSignup: {
    auth: false,
    handler: function (_: Request, h: ResponseToolkit) {
      return h.view("account/sign-up");
    },
  } as EndpointDef,
  signUp: {
    auth: false,
    validate: {
      payload: SignUpUserRequestSpecification,
      failAction: function (request: Request, h: ResponseToolkit, error: ValidationError) {
        return h.view("account/sign-up", { errors: error.details }).takeover().code(400);
      },
    },
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.payload as ISignUpUserRequestDto;

      if (await request.container.userRepository.getByEmail$(user.email)) {
        return h.view("account/sign-up", {
          errors: [
            {
              message: "Account already exists",
              path: ["email"],
            } as ValidationErrorItem,
          ],
        });
      }

      await request.container.userRepository.create$(user);
      return h.redirect("/account/login");
    },
  } as EndpointDef,
};
