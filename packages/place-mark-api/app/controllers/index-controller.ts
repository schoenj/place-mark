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
  public async index$(): Promise<ResponseObject> {
    const placeMarks = await this.container.placeMarkRepository.getLookup$();
    return this.render(new IndexViewModel(placeMarks));
  }
}
