import dotenv from "dotenv";

/**
 * Initialize dotenv
 */
const result = dotenv.config();

/**
 * Declares properties for sharing the config for the hapi web server
 */
export interface IWebServerConfig {
  host: string;
  port: number;
}

/**
 * Declares properties for sharing the config for the general api
 */
export interface IApplicationConfig {
  webServer: IWebServerConfig;
}

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
 * Loads the config from the .env file
 * @return IApplicationConfig The application config
 */
export function getConfig(): IApplicationConfig {
  if (result.error) {
    throw new Error(`An error occurred while reading .env file. Error reported: ${result.error.message}`);
  }

  const config: IApplicationConfig = {
    webServer: getWebServerConfig(),
  };
  Object.freeze(config);

  return config;
}
