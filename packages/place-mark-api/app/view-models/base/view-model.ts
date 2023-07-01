import { IAuthenticatedUser } from "../../services/interfaces/index.js";

export abstract class ViewModel {
  private _authenticatedUser: IAuthenticatedUser | null;

  protected constructor(private _view: string, private _pageTitle: string) {}

  public get view(): string {
    return this._view;
  }

  public get title(): string {
    return this._pageTitle;
  }

  public get user(): IAuthenticatedUser | null {
    return this._authenticatedUser;
  }

  public set user(value: IAuthenticatedUser | null) {
    this._authenticatedUser = value;
  }

  public get authenticated(): boolean {
    return this._authenticatedUser !== null;
  }

  public get admin(): boolean {
    return (this.authenticated && this._authenticatedUser?.admin) || false;
  }
}
