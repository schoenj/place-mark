import { ResponseObject } from "@hapi/hapi";
import { ValidationErrorItem } from "joi";
import {
  Controller,
  createFailedForm,
  createForm,
  Route,
  signInFormDefinition,
  SignInUserRequestSpecification,
  signUpFormDefinition,
  SignUpUserRequestSpecification,
  userUpdateEmailFormDefinition,
  UserUpdateEmailRequestSpecification,
  userUpdatePasswordFormDefinition,
  UserUpdatePasswordRequestSpecification,
} from "../core/index.js";
import { ISignInUserRequestDto, ISignUpUserRequestDto, IUserUpdateEmailRequestDto, IUserUpdatePasswordRequestDto } from "../core/dtos/index.js";
import { SignUpViewModel, SignInViewModel, UpdateEmailViewModel, UpdatePasswordViewModel } from "../view-models/index.js";
import { createFailAction } from "./utils.js";

export class AccountController extends Controller {
  @Route({
    method: "GET",
    path: "/account/sign-up",
    options: {
      auth: false,
    },
  })
  public showSignup(): ResponseObject {
    return this.render(new SignUpViewModel(createForm(signUpFormDefinition)));
  }

  @Route({
    method: "POST",
    path: "/account/sign-up",
    options: {
      auth: false,
      validate: {
        payload: SignUpUserRequestSpecification,
        failAction: createFailAction(signUpFormDefinition, (form) => new SignUpViewModel(form)),
      },
    },
  })
  public async signUp$(): Promise<ResponseObject> {
    const user = this.request.payload as ISignUpUserRequestDto;

    if (await this.container.userRepository.getByEmail$(user.email)) {
      const errors: ValidationErrorItem[] = [
        {
          message: "Account already exists",
          path: ["email"],
        } as ValidationErrorItem,
      ];

      const model = new SignUpViewModel(createFailedForm(signUpFormDefinition, user, errors));
      return this.render(model).code(400);
    }

    await this.container.userRepository.create$(user);
    return this.h.redirect("/account/sign-in");
  }

  @Route({
    method: "GET",
    path: "/account/sign-in",
    options: {
      auth: false,
    },
  })
  public showSignIn(): ResponseObject {
    return this.render(new SignInViewModel(createForm(signInFormDefinition)));
  }

  @Route({
    method: "POST",
    path: "/account/sign-in",
    options: {
      auth: false,
      validate: {
        payload: SignInUserRequestSpecification,
        failAction: createFailAction(signInFormDefinition, (form) => new SignInViewModel(form)),
      },
    },
  })
  public async signIn$(): Promise<ResponseObject> {
    const credentials = this.request.payload as ISignInUserRequestDto;
    const result = await this.container.authService.authenticate$(credentials);
    if (!result.success) {
      const errors: ValidationErrorItem[] = [
        {
          message: "Email or password is invalid",
          path: ["email"],
        } as ValidationErrorItem,
      ];
      const model = new SignInViewModel(createFailedForm(signInFormDefinition, this.request.payload as ISignInUserRequestDto, errors));
      return this.h.view(model.view, model).code(400);
    }

    this.request.cookieAuth.set({ id: result.user.id });
    return this.h.redirect("/");
  }

  @Route({
    method: "GET",
    path: "/account/logout",
    options: {
      auth: false,
    },
  })
  public logout(): ResponseObject {
    this.request.cookieAuth.clear();
    return this.h.redirect("/");
  }

  @Route({
    method: "GET",
    path: "/account/email",
    options: {
      auth: { strategy: "session" },
    },
  })
  public async showUpdateEmail$(): Promise<ResponseObject> {
    const user = await this.container.userRepository.getById$(this.user?.id as string);
    return this.render(new UpdateEmailViewModel(createForm(userUpdateEmailFormDefinition, { email: user?.email })));
  }

  @Route({
    method: "POST",
    path: "/account/email",
    options: {
      auth: { strategy: "session" },
      validate: {
        payload: UserUpdateEmailRequestSpecification,
        failAction: createFailAction(userUpdateEmailFormDefinition, (form) => new UpdateEmailViewModel(form)),
      },
    },
  })
  public async updateEmail$(): Promise<ResponseObject> {
    const dto = this.request.payload as IUserUpdateEmailRequestDto;
    await this.container.userRepository.updateEmail$(this.user?.id as string, dto.email);
    return this.h.redirect(`/user/${this.user?.id}`);
  }

  @Route({
    method: "GET",
    path: "/account/password",
    options: {
      auth: { strategy: "session" },
    },
  })
  public async showUpdatePassword(): Promise<ResponseObject> {
    return this.render(new UpdatePasswordViewModel(createForm(userUpdatePasswordFormDefinition)));
  }

  @Route({
    method: "POST",
    path: "/account/password",
    options: {
      auth: { strategy: "session" },
      validate: {
        payload: UserUpdatePasswordRequestSpecification,
        failAction: createFailAction(userUpdatePasswordFormDefinition, (form) => new UpdatePasswordViewModel(form)),
      },
    },
  })
  public async updatePassword$(): Promise<ResponseObject> {
    const dto = this.request.payload as IUserUpdatePasswordRequestDto;

    const errors: ValidationErrorItem[] = [];

    if (dto.password !== dto.passwordAgain) {
      errors.push({
        message: "Passwords do not match",
        path: ["password"],
      } as ValidationErrorItem);
    }

    const user = await this.container.userRepository.getByEmail$(this.user?.email as string);
    if (user?.password !== dto.oldPassword) {
      errors.push({
        message: "Old password is not correct",
        path: ["oldPassword"],
      } as ValidationErrorItem);
    }

    if (errors.length) {
      const model = new UpdatePasswordViewModel(createFailedForm(userUpdatePasswordFormDefinition, this.request.payload as IUserUpdatePasswordRequestDto, errors));
      return this.h.view(model.view, model).code(400);
    }

    await this.container.userRepository.updatePassword$(this.user?.id as string, dto.password);
    return this.h.redirect(`/user/${this.user?.id}`);
  }
}
