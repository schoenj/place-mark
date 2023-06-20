import { Server } from "@hapi/hapi";
import Cookie, { Options as HapiCookieOptions } from "@hapi/cookie";
import jwt, { Options as HapiJwtOptions } from "hapi-auth-jwt2";
import { IApplicationConfig } from "../../config/interfaces/index.js";

export async function registerCookieAuthentication$(server: Server, config: IApplicationConfig): Promise<void> {
  await server.register(Cookie);
  const options: HapiCookieOptions = {
    cookie: {
      name: config.cookie.name,
      password: config.cookie.password,
      isSecure: config.cookie.isSecure,
      path: "/",
    },
    redirectTo: "/",
    validate: async (request, session) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const authResult = await request!.container.authService.validate$(session);
      return authResult;
    },
  };
  server.auth.strategy("session", "cookie", options);
  server.auth.default("session");
}

export async function registerJwtAuthentication$(server: Server, config: IApplicationConfig): Promise<void> {
  await server.register(jwt);
  const options: HapiJwtOptions = {
    key: config.cookie.password,
    validate: async (decoded, request) => {
      const authResult = await request?.container.authService.validate$(decoded);
      return authResult;
    },
    verifyOptions: { algorithms: ["HS256"] },
  };
  server.auth.strategy("jwt", "jwt", options);
}