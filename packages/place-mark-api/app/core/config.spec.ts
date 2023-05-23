import { assert } from "chai";
import { getConfig, IApplicationConfig } from "./config.js";

suite("config-tests", () => {
  test("getConfig() should work", () => {
    // Mock Variables
    process.env.WEBSERVER_HOST = "0.0.0.0";
    process.env.WEBSERVER_PORT = "8080";
    process.env.COOKIE_NAME = "cookie_monster";
    process.env.COOKIE_PASSWORD = "Cookies! Me eat!";
    process.env.COOKIE_SECURE = "true";

    // Check Config
    let config: IApplicationConfig = getConfig();
    assert.isTrue(Object.isFrozen(config));

    // WebServer Config
    assert.equal("0.0.0.0", config.webServer.host);
    assert.equal(8080, config.webServer.port);
    assert.isTrue(Object.isFrozen(config.webServer));

    // Cookie Config (COOKIE_SECURE=true)
    assert.equal("cookie_monster", config.cookie.name);
    assert.equal("Cookies! Me eat!", config.cookie.password);
    assert.isTrue(config.cookie.isSecure);
    assert.isTrue(Object.isFrozen(config.cookie));

    // Cookie Config (COOKIE_SECURE=1)
    process.env.COOKIE_SECURE = "1";
    config = getConfig();
    assert.isTrue(config.cookie.isSecure);
  });

  test("getConfig() defaults should work", () => {
    process.env.WEBSERVER_HOST = "";
    process.env.WEBSERVER_PORT = "";
    process.env.COOKIE_NAME = "";
    process.env.COOKIE_PASSWORD = "";
    process.env.COOKIE_SECURE = "";
    const config: IApplicationConfig = getConfig();

    // WebServer defaults
    assert.equal("localhost", config.webServer.host);
    assert.equal(3000, config.webServer.port);
    assert.equal("auth", config.cookie.name);
    assert.equal("place-mark", config.cookie.password);
    assert.isFalse(config.cookie.isSecure);
  });

  test("getConfig() validation should throw errors", () => {
    process.env.WEBSERVER_HOST = undefined;
    process.env.WEBSERVER_PORT = "3000";

    // Negative port
    process.env.WEBSERVER_PORT = "-1";
    assert.throw(() => getConfig());

    // Port over 65535
    process.env.WEBSERVER_PORT = "65536";
    assert.throw(() => getConfig());
  });
});
