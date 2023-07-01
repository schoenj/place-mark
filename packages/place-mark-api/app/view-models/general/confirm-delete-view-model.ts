import { ViewModel } from "../base/view-model.js";
import { IConfirmDeleteRequest } from "../../core/dtos/index.js";
import { createConfirmDeleteFormDefinition, createForm, IForm } from "../../core/index.js";

export class ConfirmDeleteViewModel extends ViewModel {
  private readonly _form: IForm<IConfirmDeleteRequest>;

  constructor(private _id: string, private _designation: string, private _path: string) {
    super("general/delete-confirm", "Confirm Deletion");
    this._form = createForm(createConfirmDeleteFormDefinition(this._path));
  }

  public get id(): string {
    return this._id;
  }

  public get designation(): string {
    return this._designation;
  }

  public get form(): IForm<IConfirmDeleteRequest> {
    return this._form;
  }
}
