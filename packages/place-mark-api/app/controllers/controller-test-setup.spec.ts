import { PrismaClient } from "@prisma/client";
import { assert } from "chai";
import { IApplicationConfig, IContainer, IUserRepository } from "../core/index.js";

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
};

export class ContainerMock implements IContainer {
  public userRepoMock: IUserRepository | null;

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
}
