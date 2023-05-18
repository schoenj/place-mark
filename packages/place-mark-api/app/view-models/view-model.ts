export abstract class ViewModel {
  constructor(private _view: string, private _pageTitle: string) {}

  public get view(): string {
    return this._view;
  }

  public get title(): string {
    return this._pageTitle;
  }
}