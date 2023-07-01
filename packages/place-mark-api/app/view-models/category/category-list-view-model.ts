import { ViewModel } from "../base/view-model.js";
import { ICategoryReadOnlyDto, IPagedListRequest, IPagedListResponse } from "../../core/dtos/index.js";
import { IForm } from "../../core/index.js";

export class CategoryListViewModel extends ViewModel {
  constructor(private _tableForm: IForm<IPagedListRequest>, private _result: IPagedListResponse<ICategoryReadOnlyDto>) {
    super("category/category-list", "Category List");
  }

  public get tableForm(): IForm<IPagedListRequest> {
    return this._tableForm;
  }

  public get result(): IPagedListResponse<ICategoryReadOnlyDto> {
    return this._result;
  }
}
