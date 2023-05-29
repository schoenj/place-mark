import { ReqRef, ServerRoute } from "@hapi/hapi";
import { accountController } from "./controllers/account-controller.js";

export const webRoutes: ServerRoute<ReqRef>[] = [
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
  {
    method: "GET",
    path: "/account/sign-in",
    options: accountController.showSignIn,
  },
  {
    method: "POST",
    path: "/account/sign-in",
    options: accountController.signIn,
  },
  {
    method: "GET",
    path: "/account/logout",
    options: accountController.logout,
  },
];
