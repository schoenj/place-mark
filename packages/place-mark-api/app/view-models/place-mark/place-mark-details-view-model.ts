import { ViewModel } from "../base/view-model.js";
import { IPlaceMarkReadOnlyDto } from "../../core/dtos/index.js";

export class PlaceMarkDetailsViewModel extends ViewModel {
  constructor(private _details: IPlaceMarkReadOnlyDto) {
    super("place-mark/place-mark-details", `Place Mark: ${_details.designation}`);
  }

  public get details(): IPlaceMarkReadOnlyDto {
    return this._details;
  }
}
