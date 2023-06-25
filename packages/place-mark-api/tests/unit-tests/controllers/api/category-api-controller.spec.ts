import { UnitTestFixture } from "../unit-test-fixture.js";
import { ICategoryReadOnlyDto } from "../../../../app/core/dtos/index.js";
import { ICategoryRepository } from "../../../../app/repositories/interfaces/index.js";

suite("CategoryApiController Unit Tests", () => {
  let fixture: UnitTestFixture;

  setup(async () => {
    fixture = new UnitTestFixture();
    await fixture.start$();
  });

  teardown(async () => {
    await fixture.stop$();
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
});
