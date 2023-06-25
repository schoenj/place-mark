import { ITestFixtureConfig, TestFixture } from "../../test-fixture.js";
import { IContainer } from "../../../app/dependencies/interfaces/index.js";
import { ContainerMock } from "./test-setup.js";

export class UnitTestFixture extends TestFixture {
  private _started = false;

  private readonly _container: ContainerMock;

  constructor(config?: ITestFixtureConfig) {
    super(config);
    this._container = new ContainerMock();
  }

  public get inject() {
    return this.server.inject.bind(this.server);
  }

  public get container(): ContainerMock {
    return this._container;
  }

  protected createContainerInternal(): IContainer {
    return this._container;
  }

  protected get running(): boolean {
    return this._started;
  }

  protected set running(value: boolean) {
    this._started = value;
  }
}
