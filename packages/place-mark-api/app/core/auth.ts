import { Server } from "@hapi/hapi";
import Cookie, { Options as HapiCookieOptions, ValidateResponse } from "@hapi/cookie";
import { IApplicationConfig } from "./config.js";

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
      if (session && typeof session === "object" && "id" in session) {
        const user = await request?.container.userRepository.getById$(session.id as string);
        if (user) {
          return { isValid: true, credentials: user } as ValidateResponse;
        }
      }
      return { isValid: false } as ValidateResponse;
    },
  };
  server.auth.strategy("session", "cookie", options);
  server.auth.default("session");
}
