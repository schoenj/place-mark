import { AxiosError, AxiosResponse, isAxiosError } from "axios";
import { assert } from "chai";
import jwt from "jsonwebtoken";
import { kermitTheFrogUser } from "../../fixtures.js";
import { IAuthResultDto } from "../../../app/core/dtos/index.js";
import { testConfig } from "../../unit-tests/controllers/test-setup.js";
import { IntegrationTestFixture } from "./integration-test-fixture.js";

suite("AuthApiController Integration Tests", () => {
  let fixture: IntegrationTestFixture;

  setup(async () => {
    fixture = new IntegrationTestFixture();
    await fixture.start$();
  });

  teardown(async () => {
    await fixture.stop$();
  });

  suite("POST /api/auth/token Tests", () => {
    test("should return 403 if password does not match or user is not found", async () => {
      const validateError = (ex: unknown) => {
        assert.isTrue(isAxiosError(ex));
        const axiosError = ex as AxiosError<IAuthResultDto>;
        assert.equal(axiosError.response?.status, 401);
        assert.isFalse(axiosError.response?.data.success);
        assert.equal(axiosError.response?.data.message, "Invalid credentials");
        assert.isUndefined(axiosError.response?.data.token);
      };

      try {
        await fixture.axios.post("api/auth/token", { email: kermitTheFrogUser.email, password: kermitTheFrogUser.password });
        assert.fail("Axios should throw exception");
      } catch (ex) {
        validateError(ex);
      }

      const user = await fixture.prisma.user.create({ data: kermitTheFrogUser });
      try {
        await fixture.axios.post("/api/auth/token", { email: user.email, password: "something different" });
        assert.fail("Axios should throw exception");
      } catch (ex) {
        validateError(ex);
      }
    });

    test("should work", async () => {
      const user = await fixture.prisma.user.create({ data: kermitTheFrogUser });
      const response: AxiosResponse<IAuthResultDto> = await fixture.axios.post("/api/auth/token", { email: user.email, password: user.password });
      assert.equal(response.status, 200);
      assert.isTrue(response.data.success);
      assert.equal(response.data.message, "Successfully authenticated");
      assert.isNotNull(response.data.token);
      const decoded = jwt.verify(response.data.token || "", testConfig.jwt.password);
      assert.isObject(decoded);
    });
  });
});
