import { ViewModel } from "../base/view-model.js";
import { IForm } from "../../core/index.js";
import { IUserUpdatePasswordRequestDto } from "../../core/dtos/index.js";

export class UpdatePasswordViewModel extends ViewModel {
  constructor(private _form: IForm<IUserUpdatePasswordRequestDto>) {
    super("account/update-password", "Change Password");
  }

  public get form(): IForm<IUserUpdatePasswordRequestDto> {
    return this._form;
  }
}
