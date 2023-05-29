import { ResponseObject } from "@hapi/hapi";
import { Controller, Route } from "../core/index.js";

export class IndexController extends Controller {
  @Route({
    method: "GET",
    path: "/",
    options: {
      auth: false,
    },
  })
  public index(): ResponseObject {
    return this.response.view("index");
  }
}
