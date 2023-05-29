import { Request, ResponseToolkit } from "@hapi/hapi";

export abstract class Controller {
  protected request: Request;

  protected response: ResponseToolkit;

  public setContext(request: Request, response: ResponseToolkit): void {
    this.request = request;
    this.response = response;
  }
}
