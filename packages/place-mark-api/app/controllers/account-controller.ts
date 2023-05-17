import { ResponseToolkit } from "@hapi/hapi";
import { EndpointDef } from "../core/index.js";

export const accountController = {
  showSignup: {
    auth: false,
    handler: function (_: Request, h: ResponseToolkit) {
      return h.view("account/sign-up");
    },
  } as EndpointDef,
};
