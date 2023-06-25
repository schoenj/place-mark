import { Prisma, PrismaClient, User } from "@prisma/client";
import { assert } from "chai";
import axios, { AxiosInstance } from "axios";
import { ITestFixtureConfig, TestFixture } from "../../test-fixture.js";
import { IContainer } from "../../../app/dependencies/interfaces/index.js";
import { Container } from "../../../app/dependencies/index.js";

export class IntegrationTestFixture extends TestFixture {
  private readonly _prisma: PrismaClient;

  /**
   * Integration Tests cannot run in parallel, because we only use one database!
   */
  private static _started = false;

  private _axios: AxiosInstance | null;

  constructor(setup?: ITestFixtureConfig) {
    super(setup);
    this._prisma = new PrismaClient();
  }

  public get prisma(): PrismaClient {
    return this._prisma;
  }

  public createUser$(user: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  public get axios(): AxiosInstance {
    this._axios =
      this._axios ||
      axios.create({
        baseURL: this.serverUrl,
        timeout: 500,
        headers: {
          Accept: "application/json",
        },
      });
    return this._axios;
  }

  public get serverUrl(): string {
    if (!this.running) {
      assert.fail("serverUrl were accessed before start$()");
    }

    return this.server.info.uri;
  }

  protected async afterStart$(): Promise<void> {
    await this.server.start();
    await this.prisma.$connect();
  }

  protected async afterStop$(): Promise<void> {
    await this.server.stop({ timeout: 1 });
    await this.prisma.placeMark.deleteMany();
    await this.prisma.category.deleteMany();
    await this.prisma.user.deleteMany();
    await this.prisma.$disconnect();
  }

  // eslint-disable-next-line class-methods-use-this
  protected get running(): boolean {
    return IntegrationTestFixture._started;
  }

  // eslint-disable-next-line class-methods-use-this
  protected set running(value: boolean) {
    IntegrationTestFixture._started = value;
  }

  protected createContainerInternal(): IContainer {
    return new Container(this.config, this.prisma);
  }
}
