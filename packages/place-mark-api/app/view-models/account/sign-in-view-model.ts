import { ISignInUserRequestDto } from "../../core/dtos/index.js";
import { ViewModel } from "../view-model.js";
import { IForm } from "../../core/index.js";

export class SignInViewModel extends ViewModel {
  constructor(private _loginForm: IForm<ISignInUserRequestDto>) {
    super("account/sign-in", "Sign In");
  }

  public get loginForm(): IForm<ISignInUserRequestDto> {
    return this._loginForm;
  }
}
