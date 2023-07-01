import { ViewModel } from "../base/view-model.js";
import { IUserUpdateEmailRequestDto } from "../../core/dtos/index.js";
import { IForm } from "../../core/index.js";

export class UpdateEmailViewModel extends ViewModel {
  constructor(private _form: IForm<IUserUpdateEmailRequestDto>) {
    super("account/update-email", "Change E-Mail Address");
  }

  public get form(): IForm<IUserUpdateEmailRequestDto> {
    return this._form;
  }
}
