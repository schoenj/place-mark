import { assert } from "chai";
import { ServerInjectResponse } from "@hapi/hapi";
import { IPaginatedListRequest, IPaginatedListResponse } from "../../../app/core/dtos/index.js";
import { ITestFixtureConfig, TestFixture } from "../../test-fixture.js";
import { IContainer } from "../../../app/dependencies/interfaces/index.js";
import { ContainerMock } from "./test-setup.js";
import { IValidationResult } from "../../../app/core/index.js";

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

  public async testGetById$<TDto extends object>(
    mock: TDto,
    path: string,
    setMock: (container: ContainerMock, mockFunc: (id: string) => Promise<TDto | null>) => void
  ): Promise<void> {
    let counter = 0;
    const mockId = "646634e51d85e59154d745c5";

    // No authentication
    setMock(this.container, (id) => {
      if (id !== mockId) {
        assert.fail("Wrong id provided");
      }
      // eslint-disable-next-line no-plusplus
      counter++;
      return Promise.resolve(null);
    });
    let response: ServerInjectResponse<TDto> = await this.inject({
      method: "GET",
      url: `/api/${path}/646634e51d85e59154d745c5`,
    });
    assert.equal(counter, 0);
    assert.equal(response.statusCode, 401);

    // Authenticated, but entry does not exist
    const token = this.authValidator.add({ id: "646634e51d85e59154d745c5", email: "byId@test.com", admin: false });
    response = await this.inject({
      method: "GET",
      url: `/api/${path}/${mockId}`,
      headers: {
        authorization: token,
      },
    });
    assert.equal(counter, 1);
    assert.equal(response.statusCode, 404);

    // success
    setMock(this.container, (id) => {
      if (id !== mockId) {
        assert.fail("Wrong id provided");
      }

      return Promise.resolve(mock);
    });
    response = await this.inject({
      method: "GET",
      url: `/api/${path}/${mockId}`,
      headers: {
        authorization: token,
      },
    });
    assert.equal(response.statusCode, 200);
    assert.isNotNull(response.result);
    assert.equal(response.result, mock);
  }

  public async testDeleteById(path: string, setMock: (container: ContainerMock, mockFunc: (id: string) => Promise<void>) => void): Promise<void> {
    const mockId = "646634e51d85e59154d745c5";
    let counter = 0;

    // No authentication
    setMock(this.container, (id) => {
      if (id !== mockId) {
        assert.fail("Wrong id provided");
      }
      // eslint-disable-next-line no-plusplus
      counter++;
      return Promise.resolve();
    });
    let response: ServerInjectResponse = await this.inject({
      method: "DELETE",
      url: `/api/${path}/${mockId}`,
    });
    assert.equal(counter, 0);
    assert.equal(response.statusCode, 401);

    // Authenticated
    const token = this.authValidator.add({ id: "646634e51d85e59154d745c5", email: "byId@test.com", admin: false });
    response = await this.inject({
      method: "DELETE",
      url: `/api/${path}/${mockId}`,
      headers: {
        authorization: token,
      },
    });
    assert.equal(counter, 1);
    assert.equal(response.statusCode, 204);
  }

  public async testGet$<TDto extends object>(
    mock: IPaginatedListResponse<TDto>,
    path: string,
    setMock: (container: ContainerMock, mockFunc: (listRequest: IPaginatedListRequest) => Promise<IPaginatedListResponse<TDto>>) => void
  ): Promise<void> {
    // No authentication
    let counter = 0;
    setMock(this.container, (listRequest) => {
      assert.isNotNull(listRequest);
      assert.isUndefined(listRequest.skip);
      assert.isUndefined(listRequest.take);
      // eslint-disable-next-line no-plusplus
      counter++;
      return Promise.resolve(mock);
    });
    let response: ServerInjectResponse = await this.inject({
      method: "GET",
      url: `/api/${path}`,
    });
    assert.equal(counter, 0);
    assert.equal(response.statusCode, 401);

    // Authenticated
    const token = this.authValidator.add({ id: "646634e51d85e59154d745c5", email: "byId@test.com", admin: false });
    response = await this.inject({
      method: "GET",
      url: `/api/${path}`,
      headers: {
        authorization: token,
      },
    });
    assert.equal(counter, 1);
    assert.equal(response.statusCode, 200);
    assert.equal(response.result, mock);

    // Skip/Take should work
    setMock(this.container, (listRequest) => {
      assert.isNotNull(listRequest);
      assert.equal(listRequest.skip, 5);
      assert.equal(listRequest.take, 10);
      // eslint-disable-next-line no-plusplus
      counter++;
      return Promise.resolve(mock);
    });
    response = await this.inject({
      method: "GET",
      url: `/api/${path}?skip=5&take=10`,
      headers: {
        authorization: token,
      },
    });
    assert.equal(counter, 2);
    assert.equal(response.statusCode, 200);
    assert.equal(response.result, mock);

    // Negative Skip
    response = await this.inject({
      method: "GET",
      url: `/api/${path}?skip=-1`,
      headers: {
        authorization: token,
      },
    });
    assert.equal(counter, 2);
    assert.equal(response.statusCode, 400);
    UnitTestFixture.assertValidationError(response, { skip: "must be greater than or equal to 0" });

    // Take lesser than 1
    response = await this.inject({
      method: "GET",
      url: `/api/${path}?take=0`,
      headers: {
        authorization: token,
      },
    });
    assert.equal(counter, 2);
    assert.equal(response.statusCode, 400);
    UnitTestFixture.assertValidationError(response, { take: "must be greater than or equal to 1" });

    // Take greater than 100
    response = await this.inject({
      method: "GET",
      url: `/api/${path}?take=101`,
      headers: {
        authorization: token,
      },
    });
    assert.equal(counter, 2);
    assert.equal(response.statusCode, 400);
    UnitTestFixture.assertValidationError(response, { take: "must be less than or equal to 100" });
  }

  private static assertValidationError(response: ServerInjectResponse, validationErrors: { [key: string]: string }) {
    assert.isArray(response.result);
    assert.isNotEmpty(response.result);
    const result = response.result as IValidationResult[];
    assert.equal(result.length, Object.keys(validationErrors).length);
    Object.keys(validationErrors).forEach((key: string) => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const tmp = result?.find((x) => x["property"] === key) as IValidationResult | null;
      assert.isNotNull(tmp);
      assert.include(tmp?.message, validationErrors[key] as string);
    });
  }
}
