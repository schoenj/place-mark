export class BusinessException extends Error {
  constructor(private _entity: string, private _message: string) {
    super(_message);
  }

  public get entity(): string {
    return this._entity;
  }
}
