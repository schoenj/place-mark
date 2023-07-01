import { ViewModel } from "../base/view-model.js";
import { ICategoryCreateReadWriteDto } from "../../core/dtos/index.js";
import { IForm } from "../../core/index.js";

export class CategoryCreateViewModel extends ViewModel {
  constructor(private _form: IForm<ICategoryCreateReadWriteDto>) {
    super("category/category-create", "New Category");
  }

  public get form(): IForm<ICategoryCreateReadWriteDto> {
    return this._form;
  }
}
