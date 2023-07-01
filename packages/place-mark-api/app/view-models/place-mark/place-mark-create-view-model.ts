import { ViewModel } from "../base/view-model.js";
import { IPlaceMarkCreateReadWriteDto } from "../../core/dtos/index.js";
import { IForm } from "../../core/index.js";

export class PlaceMarkCreateViewModel extends ViewModel {
  constructor(private _form: IForm<IPlaceMarkCreateReadWriteDto>) {
    super("place-mark/place-mark-create", "New Place-Mark");
  }

  public get form(): IForm<IPlaceMarkCreateReadWriteDto> {
    return this._form;
  }
}
