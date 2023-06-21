import { PrismaClient } from "@prisma/client";
import { assert } from "chai";
import { IContainer } from "../../../app/dependencies/interfaces/index.js";
import { IUserRepository } from "../../../app/repositories/interfaces/index.js";
import { IAuthService } from "../../../app/services/interfaces/index.js";
import { IApplicationConfig } from "../../../app/config/interfaces/index.js";

export const testConfig: IApplicationConfig = {
  webServer: {
    host: "localhost",
    port: 3000,
  },
  cookie: {
    name: "Biscuit", // Cookies, but in british ^^
    password: "SOME_LONG_PASSWORD_FOR_THE_COOKIE",
    isSecure: false,
  },
  jwt: {
    algorithm: "HS256",
    password: "SOME_LONG_PASSWORD_FOR_THE_JWT_TOKEN",
    expiresIn: 60 * 60,
  },
};

export class ContainerMock implements IContainer {
  public userRepoMock: IUserRepository | null;

  public authServiceMock: IAuthService | null;

  // eslint-disable-next-line class-methods-use-this
  public get db(): PrismaClient {
    assert.fail("PrismaClient is not available during Unit-Tests");
    throw new Error();
  }

  public get userRepository(): IUserRepository {
    if (this.userRepoMock === null) {
      assert.fail("UserRepository were accessed before mocked.");
    }

    return this.userRepoMock;
  }

  public get authService(): IAuthService {
    if (this.authServiceMock === null) {
      assert.fail("AuthService were accessed before mocked.");
    }

    return this.authServiceMock;
  }
}
