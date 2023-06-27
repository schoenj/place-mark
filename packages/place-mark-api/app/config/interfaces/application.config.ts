import { IWebServerConfig } from "./web-server.config.js";
import { ICookieConfig } from "./cookie.config.js";
import { IJwtConfig } from "./jwt.config.js";

/**
 * Declares properties for sharing the config for the general api
 */
export interface IApplicationConfig {
  webServer: IWebServerConfig;
  cookie: ICookieConfig;
  jwt: IJwtConfig;
}
