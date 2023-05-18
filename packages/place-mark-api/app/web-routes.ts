import { Route } from "./core/index.js";
import { indexController } from "./controllers/index.js";
import { accountController } from "./controllers/account-controller.js";

export const webRoutes: Route[] = [
  {
    method: "GET",
    path: "/",
    options: indexController.index,
  },
  {
    method: "GET",
    path: "/account/sign-up",
    options: accountController.showSignup,
  },
  {
    method: "POST",
    path: "/account/sign-up",
    options: accountController.signUp,
  },
];
