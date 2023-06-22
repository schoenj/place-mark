import { Request, ResponseObject, ResponseToolkit } from "@hapi/hapi";
import { IContainer } from "../../dependencies/interfaces/index.js";

export abstract class Controller {
  protected request: Request;

  protected h: ResponseToolkit;

  protected get container(): IContainer {
    return this.request.container;
  }

  public setContext(request: Request, response: ResponseToolkit): void {
    this.request = request;
    this.h = response;
  }

  protected render<T extends { view: string }>(model: T): ResponseObject {
    return this.h.view(model.view, model);
  }
}
