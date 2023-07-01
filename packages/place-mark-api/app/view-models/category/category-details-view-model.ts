import { ViewModel } from "../base/view-model.js";
import { ICategoryDetailsDto } from "../../core/dtos/index.js";

export class CategoryDetailsViewModel extends ViewModel {
  constructor(private _details: ICategoryDetailsDto) {
    super("category/category-details", `Category: ${_details.designation}`);
  }

  public get details(): ICategoryDetailsDto {
    return this._details;
  }
}
