import { Server } from "@hapi/hapi";
import Cookie, { Options as HapiCookieOptions } from "@hapi/cookie";
import { IApplicationConfig } from "./config.js";

export async function registerCookieAuthentication$(server: Server, config: IApplicationConfig): Promise<void> {
  await server.register(Cookie);
  const options: HapiCookieOptions = {
    cookie: {
      name: config.cookie.name,
      password: config.cookie.password,
      isSecure: config.cookie.isSecure,
    },
    redirectTo: "/",
  };
  server.auth.strategy("session", "cookie", options);
  server.auth.default("session");
}
