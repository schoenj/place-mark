import { ViewModel } from "./base/view-model.js";
import { IPlaceMarkLookupDto } from "../core/dtos/index.js";

export class IndexViewModel extends ViewModel {
  constructor(private _placeMarks: IPlaceMarkLookupDto[]) {
    super("index", "Home");
  }

  public get placeMarks(): IPlaceMarkLookupDto[] {
    return this._placeMarks;
  }
}
