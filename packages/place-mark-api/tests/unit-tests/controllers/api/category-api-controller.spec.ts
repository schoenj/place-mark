import { assert } from "chai";
import {ServerInjectResponse} from "@hapi/hapi";
import { UnitTestFixture } from "../unit-test-fixture.js";
import { ICategoryCreateReadWriteDto, ICategoryReadOnlyDto } from "../../../../app/core/dtos/index.js";
import {ICategoryRepository } from "../../../../app/repositories/interfaces/index.js";
import {BusinessException} from "../../../../app/core/business-exception.js";
import {IValidationResult} from "../../../../app/core/index.js";

suite("CategoryApiController Unit Tests", () => {
  let fixture: UnitTestFixture;

  setup(async () => {
    fixture = new UnitTestFixture();
    await fixture.start$();
  });

  teardown(async () => {
    await fixture.stop$();
  });

  test("POST /api/category should work", async () => {
    const mockUserId = "646634e51d85e59154d745c5";
    const mockCatId = "77734e51d85e59154d745c5";
    const mockResult: ICategoryReadOnlyDto = {
      id: mockCatId,
      designation: "Bridge",
      createdBy: {
        id: mockUserId,
        designation: "Test",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let createCounter = 0;
    let getCounter = 0;
    fixture.container.categoryRepoMock = {
      create$(category: ICategoryCreateReadWriteDto): Promise<string> {
        assert.isNotNull(category);
        assert.equal(category.designation, "Bridge");
        assert.equal(category.createdById, mockUserId);
        // eslint-disable-next-line no-plusplus
        createCounter++;
        return Promise.resolve(mockCatId);
      },
      getById$(id: string): Promise<ICategoryReadOnlyDto | null> {
        assert.equal(id, mockCatId);
        // eslint-disable-next-line no-plusplus
        getCounter++;
        return Promise.resolve(mockResult);
      },
    } as ICategoryRepository;

    // No Authentication
    let response = await fixture.inject({
      method: "POST",
      url: "/api/category",
      payload: {
        designation: "Bridge",
      },
    });
    assert.equal(response.statusCode, 401);
    assert.equal(createCounter, 0);
    assert.equal(getCounter, 0);

    // Authenticated
    const token = fixture.authValidator.add({ id: mockUserId, admin: false, email: "test@test.de" });
    response = await fixture.inject({
      method: "POST",
      url: "/api/category",
      payload: {
        designation: "Bridge",
      },
      headers: {
        authorization: token,
      },
    });
    assert.equal(response.statusCode, 201);
    assert.equal(createCounter, 1);
    assert.equal(getCounter, 1);
    assert.equal(response.result, mockResult);
    assert.isNotEmpty(Object.keys(response.headers).filter((x) => x === "location"));
    const location = response.headers.location as string;
    assert.equal(location, `/api/category/${mockCatId}`);
  });

  test("GET /api/category should work", async () => {
    await fixture.testGet$({ total: 25, data: [] as ICategoryReadOnlyDto[] }, "category", (container, mock) => {
      container.categoryRepoMock = { get$: mock } as ICategoryRepository;
    });
  });

  test("GET /api/category/{id} should work", async () => {
    await fixture.testGetById$(
      {
        id: "646634e51d85e59154d745c5",
        designation: "Landscape",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: { id: "646634e51d85e59154d745c5", designation: "Test" },
      },
      "category",
      (container, mock) => {
        container.categoryRepoMock = { getById$: mock } as ICategoryRepository;
      }
    );
  });

  test("DELETE /api/category/{id} should work", async () => {
    await fixture.testDeleteById("category", (container, mock) => {
      container.categoryRepoMock = { deleteById$: mock } as ICategoryRepository;
    });

    const mockId = "646634e51d85e59154d745c5";
    fixture.container.categoryRepoMock = {
      deleteById$(id: string): Promise<void> {
        assert.equal(id, mockId)
        throw new BusinessException("TestEntity", "Some Message");
      }
    } as ICategoryRepository;
    const token = fixture.authValidator.add({ id: mockId, email: "test@test.de", admin: false })
    const response: ServerInjectResponse<IValidationResult[]> = await fixture.inject({
      method: "DELETE",
      url: `/api/category/${mockId}`,
      headers: {
        authorization: token
      }
    });
    assert.equal(response.statusCode, 400);
    assert.isNotNull(response.result);
    assert.isArray(response.result);
    assert.equal(response.result?.length, 1);
    assert.equal(response.result?.[0].property, "id");
    assert.equal(response.result?.[0].message, "Some Message");
  });
});
