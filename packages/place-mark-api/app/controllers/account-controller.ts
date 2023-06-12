import { Lifecycle, ReqRefDefaults, Request, ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { ValidationError, ValidationErrorItem } from "joi";
import {
  Controller,
  createFailedForm,
  createForm,
  FormDefinition,
  IForm,
  ISignInUserRequestDto,
  ISignUpUserRequestDto,
  Route,
  signInFormDefinition,
  SignInUserRequestSpecification,
  signUpFormDefinition,
  SignUpUserRequestSpecification,
} from "../core/index.js";
import { SignUpViewModel, SignInViewModel, ViewModel } from "../view-models/index.js";
import FailAction = Lifecycle.FailAction;

export function createFailAction<TModel extends ViewModel, TDto extends object>(formDef: FormDefinition<TDto>, createModelFunc: (form: IForm<TDto>) => TModel): FailAction {
  return (request: Request<ReqRefDefaults>, h: ResponseToolkit<ReqRefDefaults>, error: Error | undefined) => {
    const form: IForm<TDto> = createFailedForm(formDef, request.payload as TDto, (error as ValidationError).details);
    const model: TModel = createModelFunc(form);
    return h.view(model.view, model).takeover().code(400);
  };
}

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

    if (await this.request.container.userRepository.getByEmail$(user.email)) {
      const errors: ValidationErrorItem[] = [
        {
          message: "Account already exists",
          path: ["email"],
        } as ValidationErrorItem,
      ];

      const model = new SignUpViewModel(createFailedForm(signUpFormDefinition, user, errors));
      return this.render(model).code(400);
    }

    await this.request.container.userRepository.create$(user);
    return this.response.redirect("/account/sign-in");
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
    const user = await this.request.container.userRepository.getByEmail$(credentials.email);
    if (!user || user.password !== credentials.password) {
      const errors: ValidationErrorItem[] = [
        {
          message: "Email or password is invalid",
          path: ["email"],
        } as ValidationErrorItem,
      ];
      const model = new SignInViewModel(createFailedForm(signInFormDefinition, this.request.payload as ISignInUserRequestDto, errors));
      return this.response.view(model.view, model).code(400);
    }
    this.request.cookieAuth.set({ id: user.id });
    return this.response.redirect("/");
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
    return this.response.redirect("/");
  }
}
