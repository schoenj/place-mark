import { ResponseToolkit } from "@hapi/hapi";
import { EndpointDef } from "../core/index.js";

export const indexController = {
  index: {
    auth: false,
    handler: function (_: Request, h: ResponseToolkit) {
      return h.view("index");
    },
  } as EndpointDef,
};
