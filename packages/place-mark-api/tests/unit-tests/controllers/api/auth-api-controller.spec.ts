import { Server, ServerInjectResponse } from "@hapi/hapi";
import { assert } from "chai";
import { ContainerMock, testConfig } from "../test-setup.js";
import { createServer$ } from "../../../../app/server.js";
import { AuthenticationResult, IAuthCredentials, IAuthenticatedUser, IAuthService } from "../../../../app/services/interfaces/index.js";
import { IValidationResult } from "../../../../app/core/index.js";
import { IAuthResultDto } from "../../../../app/core/dtos/index.js";

suite("AuthApiController Unit-Tests", () => {
  let server: Server;
  let container: ContainerMock;

  setup(async () => {
    container = new ContainerMock();
    const result = await createServer$(testConfig, () => container);
    server = result.server;
  });

  suite("POST /api/auth/token Tests", () => {
    test("should work", async () => {
      const testId = "646634e51d85e59154d725c5";
      const testCredentials: IAuthCredentials = { email: "test@test.de", password: "1234" };
      const testUser: IAuthenticatedUser = { id: testId, email: testCredentials.email, admin: true };

      container.authServiceMock = {
        authenticate$<T extends IAuthCredentials>(credentials: T): Promise<AuthenticationResult> {
          assert.isNotNull(credentials);
          assert.equal(credentials.email, testCredentials.email);
          assert.equal(credentials.password, testCredentials.password);
          return Promise.resolve({ success: true, user: testUser });
        },
        createToken(user: IAuthenticatedUser): string {
          assert.isNotNull(user);
          assert.equal(user, testUser);
          return "some-token";
        },
      } as IAuthService;

      const result: ServerInjectResponse<IAuthResultDto> = await server.inject({
        method: "POST",
        url: "/api/auth/token",
        payload: testCredentials,
      });

      assert.equal(result.statusCode, 200);
      assert.isTrue(result.result?.success);
      assert.equal(result.result?.message, "Successfully authenticated");
      assert.equal(result.result?.token, "some-token");
    });

    test("No success if authentication failes", async () => {
      const testCredentials: IAuthCredentials = { email: "test@test.de", password: "1234" };
      container.authServiceMock = {
        authenticate$<T extends IAuthCredentials>(credentials: T): Promise<AuthenticationResult> {
          assert.isNotNull(credentials);
          assert.equal(credentials.email, testCredentials.email);
          assert.equal(credentials.password, testCredentials.password);
          return Promise.resolve({ success: false });
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        createToken(_: IAuthenticatedUser): string {
          assert.fail("createToken should not be called");
        },
      } as IAuthService;

      const result: ServerInjectResponse<IAuthResultDto> = await server.inject({
        method: "POST",
        url: "/api/auth/token",
        payload: testCredentials,
      });

      assert.equal(result.statusCode, 401);
      assert.isFalse(result.result?.success);
      assert.equal(result.result?.message, "Invalid credentials");
      assert.isUndefined(result.result?.token);
    });

    test("Payload should be validated", async () => {
      container.authServiceMock = {
        authenticate$<T extends IAuthCredentials>(credentials: T): Promise<AuthenticationResult> {
          assert.isNotNull(credentials);
          assert.fail("Service should not be called");
          throw new Error();
        },
      } as IAuthService;

      const assertCall$ = async (payload: object, validationErrors: { [key: string]: string }) => {
        const response: ServerInjectResponse<IValidationResult[]> = await server.inject({
          method: "POST",
          url: "/api/auth/token",
          payload: payload,
        });
        assert.equal(response.statusCode, 400);
        assert.isNotNull(response.result);
        assert.equal(response.result?.length, Object.keys(validationErrors).length);
        Object.keys(validationErrors).forEach((key: string) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const tmp = response.result?.find((x) => x["property"] === key) as IValidationResult | null;
          assert.isNotNull(tmp);
          assert.include(tmp?.message, validationErrors[key] as string);
        });
      };

      await assertCall$({}, { email: "is required" });
      await assertCall$({ email: "email@to-test.com" }, { password: "is required" });
    });
  });
});
