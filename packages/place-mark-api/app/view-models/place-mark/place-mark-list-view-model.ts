import { ViewModel } from "../base/view-model.js";
import { IPagedListRequest, IPagedListResponse, IPlaceMarkReadOnlyDto } from "../../core/dtos/index.js";
import { IForm } from "../../core/index.js";

export class PlaceMarkListViewModel extends ViewModel {
  constructor(private _tableForm: IForm<IPagedListRequest>, private _result: IPagedListResponse<IPlaceMarkReadOnlyDto>) {
    super("place-mark/place-mark-list", "Place mark List");
  }

  public get tableForm(): IForm<IPagedListRequest> {
    return this._tableForm;
  }

  public get result(): IPagedListResponse<IPlaceMarkReadOnlyDto> {
    return this._result;
  }
}
