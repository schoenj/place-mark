import { ViewModel } from "../base/view-model.js";
import { IPagedListRequest, IPagedListResponse, IUserReadOnlyDto } from "../../core/dtos/index.js";
import { IForm } from "../../core/index.js";

export class UserListViewModel extends ViewModel {
  constructor(private _tableForm: IForm<IPagedListRequest>, private _result: IPagedListResponse<IUserReadOnlyDto>) {
    super("user/user-list", "User List");
  }

  public get tableForm(): IForm<IPagedListRequest> {
    return this._tableForm;
  }

  public get result(): IPagedListResponse<IUserReadOnlyDto> {
    return this._result;
  }
}
