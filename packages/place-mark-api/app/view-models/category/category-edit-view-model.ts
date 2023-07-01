import { ViewModel } from "../base/view-model.js";
import { ICategoryReadWriteDto } from "../../core/dtos/index.js";
import { IForm } from "../../core/index.js";

export class CategoryEditViewModel extends ViewModel {
  constructor(private _id: string, private _form: IForm<ICategoryReadWriteDto>) {
    super("category/category-edit", "Edit Category");
  }

  public get id(): string {
    return this._id;
  }

  public get form(): IForm<ICategoryReadWriteDto> {
    return this._form;
  }
}
