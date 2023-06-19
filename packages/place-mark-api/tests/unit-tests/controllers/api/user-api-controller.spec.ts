import { Server, ServerInjectResponse } from "@hapi/hapi";
import { assert } from "chai";
import { ContainerMock, testConfig } from "../test-setup.js";
import { createServer$ } from "../../../../app/server.js";
import { IPaginatedListRequest, IPaginatedListResponse, IUserReadOnlyDto, IUserRepository, IValidationResult } from "../../../../app/core/index.js";
import { toQueryString, QueryParams } from "../../../utils.js";

suite("UserApiController Unit-Tests", () => {
  let server: Server;
  let container: ContainerMock;

  setup(async () => {
    container = new ContainerMock();
    const result = await createServer$(testConfig, () => container);
    server = result.server;
  });

  suite("GET /api/user Tests", () => {
    test("empty params should work", async () => {
      const mockedResult: IPaginatedListResponse<IUserReadOnlyDto> = {
        total: 0,
        data: [],
      };
      let repoCalled = false;
      container.userRepoMock = {
        get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IUserReadOnlyDto>> {
          assert.isNotNull(listRequest);
          assert.isUndefined(listRequest.skip);
          assert.isUndefined(listRequest.take);
          if (repoCalled) {
            assert.fail("UserRepository.get$ called twice.");
          }
          repoCalled = true;
          return Promise.resolve(mockedResult);
        },
      } as IUserRepository;

      const response = await server.inject({
        method: "GET",
        url: "/api/user",
      });

      assert.equal(response.statusCode, 200);
      assert.isNotNull(response.result);
      assert.equal(response.result, mockedResult);
      assert.isTrue(repoCalled);
    });

    test("correct params should be extracted", async () => {
      const mockedResult: IPaginatedListResponse<IUserReadOnlyDto> = {
        total: 0,
        data: [],
      };
      let repoCalled = 0;
      container.userRepoMock = {
        get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IUserReadOnlyDto>> {
          assert.isNotNull(listRequest);

          switch (repoCalled) {
            case 0:
              assert.equal(listRequest.skip, 25);
              assert.isUndefined(listRequest.take);
              break;
            case 1:
              assert.isUndefined(listRequest.skip);
              assert.equal(listRequest.take, 30);
              break;
            case 2:
              assert.equal(listRequest.skip, 99);
              assert.equal(listRequest.take, 3);
              break;
            default:
              assert.fail("UserRepository.get$ called more than three times.");
              break;
          }
          // eslint-disable-next-line no-plusplus
          repoCalled++;
          return Promise.resolve(mockedResult);
        },
      } as IUserRepository;

      const call$ = async (query: QueryParams) => {
        const response = await server.inject({
          method: "GET",
          url: `/api/user?${toQueryString(query)}`,
        });

        assert.equal(response.statusCode, 200);
        assert.isNotNull(response.result);
        assert.equal(response.result, mockedResult);
      };

      await call$({ skip: 25 });
      await call$({ take: 30 });
      await call$({ skip: 99, take: 3 });
      assert.equal(repoCalled, 3);
    });

    test("invalid params should return 400", async () => {
      const assertCall$ = async (query: QueryParams, validationErrors: { [key: string]: string }) => {
        const response: ServerInjectResponse<IValidationResult[]> = await server.inject({
          method: "GET",
          url: `/api/user?${toQueryString(query)}`,
        });
        assert.equal(response.statusCode, 400);

        assert.isNotNull(response.result);
        assert.equal(response.result?.length, Object.keys(validationErrors).length);
        Object.keys(validationErrors).forEach((key: string) => {
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const tmp = response.result?.find((x) => x["property"] === key) as IValidationResult | null;
          assert.isNotNull(tmp);
          assert.include(tmp?.message, validationErrors[key] as string);
        });
      };

      await assertCall$({ take: -1 }, { take: "must be greater than or equal to 1" });
      await assertCall$({ take: 101 }, { take: "must be less than or equal to 100" });
      await assertCall$({ skip: -1 }, { skip: "must be greater than or equal to 0" });
    });
  });

  suite("GET /api/user/{id} Tests", () => {
    test("should return 200 on success", async () => {
      const mockUser: IUserReadOnlyDto = {
        id: "646634e51d85e59154d725c5",
        firstName: "Cookie",
        lastName: "Monster",
        email: "cookie.monster@sesame-street.de",
        createdAt: new Date(),
        updatedAt: new Date(),
        admin: true,
      };
      container.userRepoMock = {
        getById$(id: string): Promise<IUserReadOnlyDto | null> {
          if (id !== "646634e51d85e59154d725c5") {
            assert.fail("Wrong id supplied");
          }

          return Promise.resolve(mockUser);
        },
      } as IUserRepository;

      const response: ServerInjectResponse<IUserReadOnlyDto> = await server.inject({
        method: "GET",
        url: "/api/user/646634e51d85e59154d725c5",
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.result, mockUser);
    });

    test("should return 404 on not found", async () => {
      container.userRepoMock = {
        getById$(id: string): Promise<IUserReadOnlyDto | null> {
          assert.equal(id, "646634e51d85e59154d725c5");
          return Promise.resolve(null);
        },
      } as IUserRepository;
      const response = await server.inject({
        method: "GET",
        url: "/api/user/646634e51d85e59154d725c5",
      });

      assert.equal(response.statusCode, 404);
    });
  });
});
