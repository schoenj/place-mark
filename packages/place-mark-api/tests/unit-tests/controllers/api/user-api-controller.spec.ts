import { IUserReadOnlyDto } from "@schoenj/place-mark-core";
import { IUserRepository } from "../../../../app/repositories/interfaces/index.js";
import { UnitTestFixture } from "../unit-test-fixture.js";
import { cookieMonsterUser } from "../../../fixtures.js";

suite("UserApiController Unit-Tests", () => {
  let fixture: UnitTestFixture;

  setup(async () => {
    fixture = new UnitTestFixture();
    await fixture.start$();
  });

  teardown(async () => {
    await fixture.stop$();
  });

  test("GET /api/user should work", async () => {
    await fixture.testGet$({ total: 5, data: [] as IUserReadOnlyDto[] }, "user", (container, mock) => {
      container.userRepoMock = { get$: mock } as IUserRepository;
    });
  });

  test("GET /api/user/{id} should work", async () => {
    const mockUser: IUserReadOnlyDto = {
      ...cookieMonsterUser,
      admin: true,
      id: "646634e51d85e59154d745c5",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // eslint-disable-next-line @typescript-eslint/dot-notation
    delete (mockUser as never)["password"];

    await fixture.testGetById$(mockUser, "user", (container, mock) => {
      container.userRepoMock = { getById$: mock } as IUserRepository;
    });
  });

  test("DELETE /api/user/{id} should work", async () => {
    await fixture.testDeleteById("user", (container, mock) => {
      container.userRepoMock = { deleteById$: mock } as IUserRepository;
    });
  });
});
