import { Server } from "@hapi/hapi";
import { PrismaClient, User } from "@prisma/client";
import { assert } from "chai";
import { createServer$ } from "../server.js";
import { IApplicationConfig, IContainer, ICreateUserReadWriteDto, IUserRepository } from "../core/index.js";

const testConfig: IApplicationConfig = {
  webServer: {
    host: "localhost",
    port: 3000,
  },
  cookie: {
    name: "Biscuit", // Cookies, but in british ^^
    password: "SOME_LONG_PASSWORD_FOR_THE_COOKIE",
    isSecure: false,
  },
};

class ContainerMock implements IContainer {
  public userRepoMock: IUserRepository | null;

  // eslint-disable-next-line class-methods-use-this
  public get db(): PrismaClient {
    throw new Error("PrismaClient is not available during Unit-Tests");
  }

  public get userRepository(): IUserRepository {
    if (this.userRepoMock === null) {
      throw new Error("UserRepository were accessed before mocked.");
    }

    return this.userRepoMock;
  }
}

suite("AccountController Unit-Tests", () => {
  let server: Server;
  let container: ContainerMock;

  setup(async () => {
    container = new ContainerMock();
    const result = await createServer$(testConfig, () => container);
    server = result.server;
  });

  suite("Sign-Up-Page Tests", () => {
    test("GET should return 200", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/account/sign-up",
      });
      assert.equal(200, response.statusCode);
    });

    test("POST should redirect to login page on success", async () => {
      let userSearched = false;
      let created = false;
      container.userRepoMock = {
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

      const response = await server.inject({
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
      const response = await server.inject({
        method: "GET",
        url: "/account/sign-in",
      });
      assert.equal(200, response.statusCode);
    });

    test("POST should redirect to home on success", async () => {
      let userFetched = false;
      container.userRepoMock = {
        getByEmail$(email: string): Promise<User | null> {
          assert.isFalse(userFetched);
          userFetched = true;
          if (email !== "cookie.monster@sesame-street.de") {
            return Promise.resolve(null);
          }

          return Promise.resolve({
            password: "1234qwer",
          } as User);
        },
      } as IUserRepository;
      const response = await server.inject({
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
    });
  });
});
