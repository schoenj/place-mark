import { assert } from "chai";
import { getConfig, IApplicationConfig } from "./config";

suite("config-tests", () => {
  test("getConfig() should work", () => {
    // Mock Variables
    process.env.WEBSERVER_HOST = "0.0.0.0";
    process.env.WEBSERVER_PORT = "8080";

    // Check Config
    const config: IApplicationConfig = getConfig();
    assert.isTrue(Object.isFrozen(config));

    // WebServer Config
    assert.equal("0.0.0.0", config.webServer.host);
    assert.equal(8080, config.webServer.port);
    assert.isTrue(Object.isFrozen(config.webServer));
  });

  test("getConfig() defaults should work", () => {
    process.env.WEBSERVER_HOST = "";
    process.env.WEBSERVER_PORT = "";
    const config: IApplicationConfig = getConfig();

    // WebServer defaults
    assert.equal("localhost", config.webServer.host);
    assert.equal(3000, config.webServer.port);
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
