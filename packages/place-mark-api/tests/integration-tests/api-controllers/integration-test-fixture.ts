import { Prisma, PrismaClient, User } from "@prisma/client";
import { assert } from "chai";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { ITestFixtureConfig, TestFixture } from "../../test-fixture.js";
import { IContainer } from "../../../app/dependencies/interfaces/index.js";
import { Container } from "../../../app/dependencies/index.js";
import { IAuthResultDto, IPaginatedListResponse } from "../../../app/core/dtos/index.js";

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
        timeout: 5000,
        headers: {
          Accept: "application/json",
        },
      });
    return this._axios;
  }

  public async authenticate$(user: { email: string; password: string }): Promise<string> {
    const response: AxiosResponse<IAuthResultDto> = await this.axios.post("/api/auth/token", { email: user.email, password: user.password });
    assert.equal(response.status, 200);
    assert.isNotNull(response.data.token);
    return response.data.token as string;
  }

  public get serverUrl(): string {
    if (!this.running) {
      assert.fail("serverUrl were accessed before start$()");
    }

    return this.server.info.uri;
  }

  public async testGetById$<T extends { id: string }, TDto extends object>(create$: () => Promise<T>, path: string, cmp: (expected: T, actual: TDto) => void): Promise<void> {
    // Authentication with wrong id
    try {
      await this.axios.get(`/api/${path}/646634e51d85e59154d725c5`);
    } catch (err) {
      assert.isTrue(axios.isAxiosError(err));
      const axiosError = err as AxiosError;
      assert.isNotNull(axiosError);
      assert.equal(axiosError.response?.status, 401);
    }

    // Authenticated, but entry does not exist
    const token = this.authValidator.add({ id: "646634e51d85e59154d745c5", email: "byId@test.com", admin: false });
    const data = { headers: { Authorization: token } };
    try {
      await this.axios.get(`/api/${path}/646634e51d85e59154d725c5`, data);
    } catch (err) {
      assert.isTrue(axios.isAxiosError(err));
      const axiosError = err as AxiosError;
      assert.isNotNull(axiosError);
      assert.equal(axiosError.response?.status, 404);
    }

    // Success
    const expected: T = await create$();
    const response: AxiosResponse<TDto> = await this.axios.get(`/api/${path}/${expected.id}`, data);
    assert.equal(response.status, 200);
    cmp(expected, response.data);
  }

  public async testUpdate$<T extends { id: string }, TUpdateDto extends { id: string }, TResult extends object>(
      path: string,
      create$: () => Promise<T>,
      dto: TUpdateDto,
      find$: (id: string) => Promise<T>,
      cmpEntity: (created: T, updated: T, dto: TUpdateDto) => void,
      cmpResult: (updated: T, dto: TResult) => void
  ): Promise<void> {
    // Authentication with wrong id
    try {
      await this.axios.put(`/api/${path}`, { ...dto, id: "646634e51d85e59154d745c5" });
      assert.fail("Should have thrown an exception");
    } catch (err) {
      assert.isTrue(axios.isAxiosError(err));
      const axiosError = err as AxiosError;
      assert.isNotNull(axiosError);
      assert.equal(axiosError.response?.status, 401);
    }

    // Authenticated, but entry does not exist
    const token = this.authValidator.add({ id: "646634e51d85e59154d745c5", email: "test@test.de", admin: false });
    const call$ = (payload: TUpdateDto) => this.axios.put(
        `/api/${path}`,
        payload,
        { headers: { Authorization: token } }
    );
    try {
      await call$({ ...dto, id: "646634e51d85e59154d745c5" });
    } catch (ex) {
      assert.isTrue(axios.isAxiosError(ex));
      const axiosError = ex as AxiosError;
      assert.isNotNull(axiosError);
      assert.equal(axiosError.response?.status, 404);
    }

    const created: T = await create$();
    const response = await call$({ ...dto, id: created.id });
    assert.equal(response.status, 200);
    const found = await find$(created.id);
    cmpEntity(created, found, dto);
    cmpResult(found, response.data);
  }

  public async testDeleteById$<T extends { id: string }>(create$: () => Promise<T>, path: string, find$: (id: string) => Promise<T[]>): Promise<void> {
    // Authentication with wrong id
    try {
      await this.axios.delete(`/api/${path}/646634e51d85e59154d725c5`);
    } catch (err) {
      assert.isTrue(axios.isAxiosError(err));
      const axiosError = err as AxiosError;
      assert.isNotNull(axiosError);
      assert.equal(axiosError.response?.status, 401);
    }

    // Authenticated, but entry does not exist
    const token = this.authValidator.add({ id: "646634e51d85e59154d745c5", email: "byId@test.com", admin: false });
    const data = { headers: { Authorization: token } };
    let response = await this.axios.delete(`/api/${path}/646634e51d85e59154d725c5`, data);
    assert.equal(response.status, 204);

    // Success
    const created: T = await create$();
    response = await this.axios.delete(`/api/${path}/${created.id}`, data);
    assert.equal(response.status, 204);
    const found: T[] = await find$(created.id);
    assert.isEmpty(found);
  }

  public async testGet$<T extends { id: string }, TDto extends object>(
    entries: T[],
    path: string,
    cmp: (expected: T, actual: TDto) => void,
    sort: (a: T, b: T) => number
  ): Promise<void> {
    // Authentication should work
    try {
      await this.axios.get(`/api/${path}`);
    } catch (err) {
      assert.isTrue(axios.isAxiosError(err));
      const axiosError = err as AxiosError;
      assert.isNotNull(axiosError);
      assert.equal(axiosError.response?.status, 401);
    }

    // No Parameters should work
    const token = this.authValidator.add({ id: "646634e51d85e59154d745c5", email: "byId@test.com", admin: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = { headers: { Authorization: token } };
    let response: AxiosResponse<IPaginatedListResponse<TDto>> = await this.axios.get(`/api/${path}`, data);
    assert.equal(response.status, 200);
    assert.equal(response.data.total, entries.length);
    assert.isNotEmpty(response.data.data);
    const max = entries.length > 25 ? 25 : entries.length;
    assert.equal(response.data.data.length, max);
    entries.sort(sort);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < max; i++) {
      cmp(entries[i], response.data.data[i]);
    }

    // Skip/Take should work
    data = { ...data, params: { skip: 1, take: 1 } };
    response = await this.axios.get(`/api/${path}`, data);
    assert.equal(response.status, 200);
    assert.equal(response.data.total, entries.length);
    assert.isNotEmpty(response.data.data);
    assert.equal(response.data.data.length, 1);
    cmp(entries[1], response.data.data[0]);
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
