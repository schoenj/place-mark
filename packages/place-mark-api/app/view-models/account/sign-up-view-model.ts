import { ISignUpUserRequestDto } from "../../core/dtos/index.js";
import { ViewModel } from "../view-model.js";
import { IForm } from "../../core/index.js";

export class SignUpViewModel extends ViewModel {
  constructor(private _registerForm: IForm<ISignUpUserRequestDto>) {
    super("account/sign-up", "Sign Up");
  }

  public get registerForm(): IForm<ISignUpUserRequestDto> {
    return this._registerForm;
  }
}
