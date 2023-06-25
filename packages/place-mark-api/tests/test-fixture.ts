// eslint-disable-next-line max-classes-per-file
import { Server, ServerApplicationState } from "@hapi/hapi";
import { assert } from "chai";
import { ValidateResponse } from "@hapi/cookie";
import { PrismaClient } from "@prisma/client";
import { IApplicationConfig } from "../app/config/interfaces/index.js";
import { createServer$ } from "../app/server.js";
import { IContainer } from "../app/dependencies/interfaces/index.js";
import { testConfig } from "./unit-tests/controllers/test-setup.js";
import { AuthenticationResult, IAuthCredentials, IAuthenticatedUser, IAuthService } from "../app/services/interfaces/index.js";
import { IPlaceMarkRepository, IUserRepository } from "../app/repositories/interfaces/index.js";
import { TestAuthValidator } from "./test-auth-validator.js";

export interface ITestFixtureConfig {
  config?: IApplicationConfig;
}

class TestContainerWrapper implements IContainer {
  private readonly _container: IContainer;

  private readonly _authService: IAuthService;

  constructor(container: IContainer, authValidator: TestAuthValidator) {
    this._container = container;
    this._authService = {
      validate$(cookieOrDecodedContent: object | undefined): Promise<ValidateResponse> {
        const user = authValidator.validate(cookieOrDecodedContent);
        if (user) {
          return Promise.resolve({ isValid: true, credentials: { user: user } });
        }

        return container.authService.validate$(cookieOrDecodedContent);
      },
      createToken(user: IAuthenticatedUser): string {
        return container.authService.createToken(user);
      },
      authenticate$<T extends IAuthCredentials>(credentials: T): Promise<AuthenticationResult> {
        return container.authService.authenticate$(credentials);
      },
    };
  }

  get authService(): IAuthService {
    return this._authService;
  }

  get db(): PrismaClient {
    return this._container.db;
  }

  get placeMarkRepository(): IPlaceMarkRepository {
    return this._container.placeMarkRepository;
  }

  get userRepository(): IUserRepository {
    return this._container.userRepository;
  }
}

export abstract class TestFixture {
  private _server: Server<ServerApplicationState> | null;

  private readonly _config: IApplicationConfig;

  private readonly _authValidator: TestAuthValidator;

  protected constructor(setup?: ITestFixtureConfig) {
    this._config = setup?.config || testConfig;
    this._authValidator = new TestAuthValidator(this._config.jwt);
  }

  public get config(): IApplicationConfig {
    return this._config;
  }

  public get authValidator(): TestAuthValidator {
    return this._authValidator;
  }

  public get server(): Server {
    if (!this.running) {
      throw new Error("Server were accessed, before calling start$()");
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._server!;
  }

  protected abstract get running(): boolean;
  protected abstract set running(value: boolean);

  public async start$(): Promise<void> {
    if (this.running) {
      assert.fail("stop$() were not called since the last test finished!");
    }

    const { server } = await createServer$(this._config, () => this.createContainer());
    this._server = server;
    this.running = true;
    await this.afterStart$(server);
  }

  public async stop$(): Promise<void> {
    if (!this.running) {
      assert.fail("stop$() were called without calling start$() first!");
    }

    await this.afterStop$();
    this.running = false;
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  protected afterStop$(): Promise<void> {
    return Promise.resolve();
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  protected afterStart$(server: Server): Promise<void> {
    return Promise.resolve();
  }

  protected createContainer(): IContainer {
    const container: IContainer = this.createContainerInternal();
    return new TestContainerWrapper(container, this._authValidator);
  }

  protected abstract createContainerInternal(): IContainer;
}
