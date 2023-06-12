import { Request, ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { ViewModel } from "../../view-models/index.js";

export abstract class Controller {
  protected request: Request;

  protected response: ResponseToolkit;

  public setContext(request: Request, response: ResponseToolkit): void {
    this.request = request;
    this.response = response;
  }

  protected render<T extends ViewModel>(model: T): ResponseObject {
    return this.response.view(model.view, model);
  }
}
