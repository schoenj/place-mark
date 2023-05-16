import { Route } from "./core/index.js";
import { indexController } from "./controllers/index.js";

export const webRoutes: Route[] = [
  {
    method: "GET",
    path: "/",
    options: indexController.index,
  },
];
