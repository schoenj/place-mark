import { assert } from "chai";
import { Prisma, PrismaClient, User } from "@prisma/client";
import { Repository } from "../../../app/repositories/repository.js";
import { IPaginatedListResponse } from "../../../app/core/dtos/index.js";

export class RepositoryTestFixture<TRepository extends Repository> {
  private static _started = false;

  private readonly _prisma: PrismaClient;

  private readonly _repositoryFactory: (prisma: PrismaClient) => TRepository;

  private _repository: TRepository | null;

  constructor(repositoryFactory: (prisma: PrismaClient) => TRepository) {
    this._prisma = new PrismaClient();
    this._repositoryFactory = repositoryFactory;
  }

  public get repository(): TRepository {
    this._repository = this._repository || this._repositoryFactory(this.prisma);
    return this._repository;
  }

  public get prisma(): PrismaClient {
    if (!RepositoryTestFixture._started) {
      assert.fail("prisma were access before start$() were called");
    }

    return this._prisma;
  }

  // eslint-disable-next-line class-methods-use-this
  public async start$(): Promise<void> {
    if (RepositoryTestFixture._started) {
      assert.fail("start$() were called, but the last test did not called stop$()");
    }
    RepositoryTestFixture._started = true;

    await this.prisma.$connect();
  }

  // eslint-disable-next-line class-methods-use-this
  public async stop$(): Promise<void> {
    if (!RepositoryTestFixture._started) {
      assert.fail("stop$() were called, but start$() were not called before");
    }

    RepositoryTestFixture._started = false;
    await this._prisma.placeMark.deleteMany();
    await this._prisma.category.deleteMany();
    await this._prisma.user.deleteMany();
  }

  public createUser$(user: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  public async testGetById$<T extends { id: string }, TDto extends object>(
    create$: () => Promise<T>,
    func$: (repository: TRepository, id: string) => Promise<TDto | null>,
    compare: (expected: T, actual: TDto) => void
  ): Promise<void> {
    let result = await func$(this.repository, "646634e51d85e59154d725c5");
    assert.isNull(result);

    const expected: T = await create$();
    result = await func$(this.repository, expected.id);
    assert.isNotNull(result);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    compare(expected, result!);
  }

  public async testDeleteById$<T extends { id: string }>(
      create$: () => Promise<T>,
      func$: (repository: TRepository, id: string) => Promise<void>,
      exists$: (id: string) => Promise<boolean>
  ): Promise<void> {
    // Should not throw an exception when entry does not exist
    await func$(this.repository, "646634e51d85e59154d725c5");

    const created = await create$();
    await func$(this.repository, created.id);
    const exists = await exists$(created.id);
    assert.isFalse(exists);
  }

  public async testPaginate$<T extends object, TDto extends object>(
    func$: (repository: TRepository, skip: number | undefined, take: number | undefined) => Promise<IPaginatedListResponse<TDto>>,
    testData: T[],
    compare: (expected: T, actual: TDto) => void,
    sort: (a: T, b: T) => number
  ): Promise<void> {
    // Skip/Take should work
    let result = await func$(this.repository, 0, 5);
    assert.equal(result.total, testData.length);
    assert.equal(result.data.length, 5);
    result = await func$(this.repository, 0, 4);
    assert.equal(result.total, testData.length);
    assert.equal(result.data.length, 4);
    result = await func$(this.repository, 0, 1);
    assert.equal(result.total, testData.length);
    assert.equal(result.data.length, 1);
    result = await func$(this.repository, 0, 999);
    assert.equal(result.total, testData.length);
    assert.equal(result.data.length, 5);

    // Skip should work
    result = await func$(this.repository, 0, 5);
    assert.isNotNull(result);
    assert.equal(result.total, testData.length);
    assert.equal(result.data.length, 5);
    result = await func$(this.repository, 4, 5);
    assert.isNotNull(result);
    assert.equal(result.total, testData.length);
    assert.equal(result.data.length, 1);
    result = await func$(this.repository, 9999, 5);
    assert.isNotNull(result);
    assert.equal(result.total, testData.length);
    assert.equal(result.data.length, 0);

    // Select should work

    result = await func$(this.repository, 0, 1);
    assert.isNotNull(result);
    assert.isNotEmpty(result.data);
    const actual = result.data[0];
    testData.sort(sort);
    const expected = testData[0];
    compare(expected, actual);
  }
}
