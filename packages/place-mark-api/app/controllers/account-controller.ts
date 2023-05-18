import { Request, ResponseToolkit } from "@hapi/hapi";
import { ValidationError, ValidationErrorItem } from "joi";
import { createFailedForm, createForm, EndpointDef, ISignUpUserRequestDto, signUpFormDefinition, SignUpUserRequestSpecification } from "../core/index.js";
import { SignUpViewModel } from "../view-models/index.js";

export const accountController = {
  showSignup: {
    auth: false,
    handler: function (_: Request, h: ResponseToolkit) {
      const model = new SignUpViewModel(createForm(signUpFormDefinition));
      return h.view(model.view, model);
    },
  } as EndpointDef,
  signUp: {
    auth: false,
    validate: {
      payload: SignUpUserRequestSpecification,
      failAction: function (request: Request, h: ResponseToolkit, error: ValidationError) {
        const model = new SignUpViewModel(createFailedForm(signUpFormDefinition, request.payload as ISignUpUserRequestDto, error.details));
        return h.view(model.view, model).takeover().code(400);
      },
    },
    handler: async function (request: Request, h: ResponseToolkit) {
      const user = request.payload as ISignUpUserRequestDto;

      if (await request.container.userRepository.getByEmail$(user.email)) {
        const errors: ValidationErrorItem[] = [
          {
            message: "Account already exists",
            path: ["email"],
          } as ValidationErrorItem,
        ];

        const model = new SignUpViewModel(createFailedForm(signUpFormDefinition, user, errors));
        return h.view(model.view, model).code(400);
      }

      await request.container.userRepository.create$(user);
      return h.redirect("/account/login");
    },
  } as EndpointDef,
};
