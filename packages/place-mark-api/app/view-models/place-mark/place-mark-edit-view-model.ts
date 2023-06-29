import { ViewModel } from "../base/view-model.js";
import { IPlaceMarkReadWriteDto } from "../../core/dtos/index.js";
import { IForm } from "../../core/index.js";

export class PlaceMarkEditViewModel extends ViewModel {
  constructor(private _id: string, private _form: IForm<IPlaceMarkReadWriteDto>) {
    super("place-mark/place-mark-edit", "Edit Place-Mark");
  }

  public get id(): string {
    return this._id;
  }

  public get form(): IForm<IPlaceMarkReadWriteDto> {
    return this._form;
  }
}
