import dotenv from "dotenv";
import { IApplicationConfig, ICookieConfig, IJwtConfig, IWebServerConfig } from "./interfaces/index.js";

/**
 * Initialize dotenv
 */
const result = dotenv.config();

/**
 * Loads and validates the webserver config from the .env file
 * @return IWebServerConfig The webserver config
 */
function getWebServerConfig(): IWebServerConfig {
  const webServerConfig: IWebServerConfig = {
    host: process.env.WEBSERVER_HOST || "localhost",
    port: process.env.WEBSERVER_PORT ? Number.parseInt(process.env.WEBSERVER_PORT, 10) : 3000,
  };
  Object.freeze(webServerConfig);

  if (!webServerConfig.host || !webServerConfig.host.length) {
    throw new Error(`An invalid host is specified for the webserver. Given: ${process.env.WEBSERVER_HOST}`);
  }

  if (!Number.isInteger(webServerConfig.port) || webServerConfig.port < 0 || webServerConfig.port > 65535) {
    throw new Error(`An invalid port is specified for the webserver. Given: ${process.env.WEBSERVER_PORT}`);
  }

  return webServerConfig;
}

/**
 * Loads and validates the cookie config from the .env file
 * @return ICookieConfig The cookie config
 */
function getCookieConfig(): ICookieConfig {
  const cookieConfig: ICookieConfig = {
    name: process.env.COOKIE_NAME || "auth",
    password: process.env.COOKIE_PASSWORD || "",
    isSecure: process.env.COOKIE_SECURE === "true" || process.env.COOKIE_SECURE === "1",
  };
  Object.freeze(cookieConfig);

  if (!cookieConfig.password || !cookieConfig.password.length) {
    throw new Error("A password for the cookie must be specified!");
  }

  return cookieConfig;
}

/**
 * Loads and validates the jwt config from the .env file
 * @return IJwtConfig The jwt config
 */
function getJwtConfig(): IJwtConfig {
  const jwtConfig: IJwtConfig = {
    algorithm: "HS256",
    password: process.env.JWT_PASSWORD || process.env.COOKIE_PASSWORD || "",
    expiresIn: 60 * 60,
  };
  Object.freeze(jwtConfig);

  if (!jwtConfig.password || !jwtConfig.password.length) {
    throw new Error("A password for the bearer token must be specified!");
  }

  return jwtConfig;
}

/**
 * Loads the config from the .env file
 * @return IApplicationConfig The application config
 */
export function getConfig(): IApplicationConfig {
  if (result.error) {
    throw new Error(`An error occurred while reading .env file. Error reported: ${result.error.message}`);
  }

  const config: IApplicationConfig = {
    webServer: getWebServerConfig(),
    cookie: getCookieConfig(),
    jwt: getJwtConfig(),
  };
  Object.freeze(config);

  return config;
}
