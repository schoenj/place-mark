import { Request, ResponseObject, ResponseToolkit, UserCredentials } from "@hapi/hapi";
import { IContainer } from "../../dependencies/interfaces/index.js";
import { ViewModel } from "../../view-models/base/view-model.js";

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

  protected render<T extends ViewModel>(model: T): ResponseObject {
    model.user = this.user || null;
    return this.h.view(model.view, model);
  }

  public get authenticated(): boolean {
    return this.request.auth.isAuthenticated;
  }

  public get admin(): boolean {
    return this.user?.admin || false;
  }

  public get user(): UserCredentials | null | undefined {
    return this.request.auth.credentials?.user;
  }
}
