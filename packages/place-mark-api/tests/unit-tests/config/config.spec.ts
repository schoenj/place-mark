import { assert } from "chai";
import { IApplicationConfig } from "../../../app/config/interfaces/index.js";
import { getConfig } from "../../../app/config/index.js";

suite("config-tests", () => {
  test("getConfig() should work", () => {
    // Mock Variables
    process.env.WEBSERVER_HOST = "0.0.0.0";
    process.env.WEBSERVER_PORT = "8080";
    process.env.COOKIE_NAME = "cookie_monster";
    process.env.COOKIE_PASSWORD = "Cookies! Me eat!";
    process.env.COOKIE_SECURE = "true";
    process.env.JWT_PASSWORD = "I am afraid of Bears!";

    // Check Config
    let config: IApplicationConfig = getConfig();
    assert.isTrue(Object.isFrozen(config));

    // WebServer Config
    assert.equal(config.webServer.host, "0.0.0.0");
    assert.equal(config.webServer.port, 8080);
    assert.isTrue(Object.isFrozen(config.webServer));

    // Cookie Config (COOKIE_SECURE=true)
    assert.equal(config.cookie.name, "cookie_monster");
    assert.equal(config.cookie.password, "Cookies! Me eat!");
    assert.isTrue(config.cookie.isSecure);
    assert.isTrue(Object.isFrozen(config.cookie));

    // JWT Config
    assert.equal(config.jwt.algorithm, "HS256");
    assert.equal(config.jwt.expiresIn, 3600);
    assert.equal(config.jwt.password, "I am afraid of Bears!");
    assert.isTrue(Object.isFrozen(config.jwt));

    // Cookie Config (COOKIE_SECURE=1)
    process.env.COOKIE_SECURE = "1";
    config = getConfig();
    assert.isTrue(config.cookie.isSecure);
  });

  test("getConfig() defaults should work", () => {
    process.env.WEBSERVER_HOST = "";
    process.env.WEBSERVER_PORT = "";
    process.env.COOKIE_NAME = "";
    process.env.COOKIE_PASSWORD = "place-mark";
    process.env.COOKIE_SECURE = "";
    process.env.JWT_PASSWORD = "place-mark";
    const config: IApplicationConfig = getConfig();

    // WebServer defaults
    assert.equal("localhost", config.webServer.host);
    assert.equal(3000, config.webServer.port);
    assert.equal("auth", config.cookie.name);
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
