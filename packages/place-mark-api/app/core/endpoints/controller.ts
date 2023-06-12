import { Request, ResponseObject, ResponseToolkit } from "@hapi/hapi";

export abstract class Controller {
  protected request: Request;

  protected response: ResponseToolkit;

  public setContext(request: Request, response: ResponseToolkit): void {
    this.request = request;
    this.response = response;
  }

  protected render<T extends { view: string }>(model: T): ResponseObject {
    return this.response.view(model.view, model);
  }
}
