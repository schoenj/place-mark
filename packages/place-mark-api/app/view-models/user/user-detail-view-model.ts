import { ViewModel } from "../base/view-model.js";
import { IUserDetailsDto } from "../../core/dtos/index.js";

export class UserDetailViewModel extends ViewModel {
  constructor(private _details: IUserDetailsDto) {
    super("user/user-details", `User: ${_details.firstName} ${_details.lastName}`);
  }

  public get details(): IUserDetailsDto {
    return this._details;
  }
}
