import { ResponseObject } from "@hapi/hapi";
import { Controller, Route } from "../core/index.js";
import { IndexViewModel } from "../view-models/index.js";

export class IndexController extends Controller {
  @Route({
    method: "GET",
    path: "/",
    options: {
      auth: { mode: "try", strategy: "session" },
    },
  })
  public index(): ResponseObject {
    return this.render(new IndexViewModel());
  }
}
