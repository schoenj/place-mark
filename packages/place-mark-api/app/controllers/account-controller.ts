import { Request, ResponseToolkit } from "@hapi/hapi";
import { ValidationError, ValidationErrorItem } from "joi";
import {
  createFailedForm,
  createForm,
  EndpointDef,
  ISignInUserRequestDto,
  ISignUpUserRequestDto,
  signInFormDefinition,
  SignInUserRequestSpecification,
  signUpFormDefinition,
  SignUpUserRequestSpecification,
} from "../core/index.js";
import { SignUpViewModel, SignInViewModel } from "../view-models/index.js";

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
      return h.redirect("/account/sign-in");
    },
  } as EndpointDef,
  showSignIn: {
    auth: false,
    handler: function (_: Request, h: ResponseToolkit) {
      const model = new SignInViewModel(createForm(signInFormDefinition));
      return h.view(model.view, model);
    },
  } as EndpointDef,
  signIn: {
    auth: false,
    validate: {
      payload: SignInUserRequestSpecification,
      failAction: function (request: Request, h: ResponseToolkit, error: ValidationError) {
        const model = new SignInViewModel(createFailedForm(signInFormDefinition, request.payload as ISignInUserRequestDto, error.details));
        return h.view(model.view, model).takeover().code(400);
      },
    },
    handler: async function (request: Request, h: ResponseToolkit) {
      const credentials = request.payload as ISignInUserRequestDto;
      const user = await request.container.userRepository.getByEmail$(credentials.email);
      if (!user || user.password !== credentials.password) {
        const errors: ValidationErrorItem[] = [
          {
            message: "Email or password is invalid",
            path: ["email"],
          } as ValidationErrorItem,
        ];
        const model = new SignInViewModel(createFailedForm(signInFormDefinition, request.payload as ISignInUserRequestDto, errors));
        return h.view(model.view, model).code(400);
      }
      request.cookieAuth.set({ id: user.id });
      return h.redirect("/");
    },
  } as EndpointDef,
};
