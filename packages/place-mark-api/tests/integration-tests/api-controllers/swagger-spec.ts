import axios from "axios";
import { assert } from "chai";
import { IntegrationTestFixture } from "./integration-test-fixture.js";

suite("Swagger Documentation Integration Tests", () => {
  let fixture: IntegrationTestFixture;

  setup(async () => {
    fixture = new IntegrationTestFixture();
    await fixture.start$();
  });

  teardown(async () => {
    await fixture.stop$();
  });

  test("GET /swagger.json should be fetchable", async () => {
    const result = await axios.get(`${fixture.serverUrl}/swagger.json`);
    assert.equal(result.status, 200);
    assert.isObject(result.data);
  });
});
