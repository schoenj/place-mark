import { User } from "@prisma/client";
import { assert } from "chai";
import { OutgoingHttpHeader } from "http";
import { ICreateUserReadWriteDto } from "../../../app/core/dtos/index.js";
import { testConfig } from "./test-setup.js";
import { IUserRepository } from "../../../app/repositories/interfaces/index.js";
import { AuthenticationResult, IAuthCredentials, IAuthService } from "../../../app/services/interfaces/index.js";
import { UnitTestFixture } from "./unit-test-fixture.js";

suite("AccountController Unit-Tests", () => {
  let fixture: UnitTestFixture;

  setup(async () => {
    fixture = new UnitTestFixture();
    await fixture.start$();
  });

  teardown(async () => {
    await fixture.stop$();
  });

  suite("Sign-Up-Page Tests", () => {
    test("GET should return 200", async () => {
      const response = await fixture.inject({
        method: "GET",
        url: "/account/sign-up",
      });
      assert.equal(200, response.statusCode);
    });

    test("POST should redirect to login page on success", async () => {
      let userSearched = false;
      let created = false;
      fixture.container.userRepoMock = {
        getByEmail$(email: string): Promise<User | null> {
          assert.isFalse(userSearched);
          if (email === "cookie.monster@sesame-street.de") {
            userSearched = true;
            return Promise.resolve(null);
          }
          throw new Error("Unknown mail address were send to mock");
        },
        create$(user: ICreateUserReadWriteDto): Promise<User> {
          assert.isFalse(created);
          created = true;
          assert.isTrue(userSearched);
          assert.isNotNull(user);
          assert.equal("Cookie", user.firstName);
          assert.equal("Monster", user.lastName);
          assert.equal("cookie.monster@sesame-street.de", user.email);
          assert.equal("1234qwer", user.password);
          return Promise.resolve({} as User);
        },
      } as IUserRepository;

      const response = await fixture.inject({
        method: "POST",
        url: "/account/sign-up",
        payload: {
          firstName: "Cookie",
          lastName: "Monster",
          email: "cookie.monster@sesame-street.de",
          password: "1234qwer",
          passwordAgain: "1234qwer",
        },
      });
      assert.equal(302, response.statusCode);
      assert.equal("/account/sign-in", response.headers.location);
      assert.isTrue(created);
    });
  });

  suite("Sign-In-Page Tests", () => {
    test("GET should return 200", async () => {
      const response = await fixture.inject({
        method: "GET",
        url: "/account/sign-in",
      });
      assert.equal(200, response.statusCode);
    });

    test("POST should redirect to home on success", async () => {
      let userFetched = false;
      fixture.container.authServiceMock = {
        authenticate$(credentials: IAuthCredentials): Promise<AuthenticationResult> {
          assert.isFalse(userFetched);
          userFetched = true;
          if (credentials.email !== "cookie.monster@sesame-street.de") {
            return Promise.resolve({ success: false });
          }

          return Promise.resolve({
            success: true,
            user: {
              id: "1234",
              email: "cookie.monster@sesame-street.de",
              admin: false,
            },
          } as AuthenticationResult);
        },
      } as IAuthService;
      const response = await fixture.inject({
        method: "POST",
        url: "/account/sign-in",
        payload: {
          email: "cookie.monster@sesame-street.de",
          password: "1234qwer",
        },
      });
      assert.isTrue(userFetched);
      assert.equal(302, response.statusCode);
      assert.equal("/", response.headers.location);
      const setCookieHeaders = response.headers["set-cookie"] as OutgoingHttpHeader[];
      assert.isNotEmpty(setCookieHeaders);
      assert.equal(1, setCookieHeaders.length);
      const setCookieHeader = setCookieHeaders[0] as string;
      assert.equal("string", typeof setCookieHeader);
      assert.isTrue(setCookieHeader.length > testConfig.cookie.name.length);
      assert.equal(testConfig.cookie.name, setCookieHeader.substring(0, testConfig.cookie.name.length));
      assert.include(setCookieHeader, testConfig.cookie.name, "Cookie should contain the configured cookie name");
      assert.include(setCookieHeader, "Path=/", "Cookie should contain the root path");
    });
  });

  suite("Logout-Page Tests", () => {
    test("Logout should delete cookie and redirect", async () => {
      fixture.container.authServiceMock = {
        authenticate$(credentials: IAuthCredentials): Promise<AuthenticationResult> {
          if (credentials.email !== "cookie.monster@sesame-street.de") {
            return Promise.resolve({ success: false });
          }

          return Promise.resolve({
            success: true,
            user: {
              id: "1234",
              email: "cookie.monster@sesame-street.de",
              admin: false,
            },
          } as AuthenticationResult);
        },
      } as IAuthService;
      const signInResponse = await fixture.inject({
        method: "POST",
        url: "/account/sign-in",
        payload: {
          email: "cookie.monster@sesame-street.de",
          password: "1234qwer",
        },
      });
      assert.isNotEmpty(signInResponse.headers["set-cookie"]);
      let cookie = (signInResponse.headers["set-cookie"] as OutgoingHttpHeader[])[0] as string;
      cookie = cookie.substring(0, cookie.indexOf(";"));

      const logoutResponse = await fixture.inject({
        method: "GET",
        url: "/account/logout",
        headers: {
          cookie: cookie,
        },
      });

      assert.equal(302, logoutResponse.statusCode);
      assert.equal("/", logoutResponse.headers.location);
      const expireCookieHeader = (logoutResponse.headers["set-cookie"] as OutgoingHttpHeader[])[0] as string;
      assert.equal("Biscuit=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict; Path=/", expireCookieHeader);
    });
  });
});
