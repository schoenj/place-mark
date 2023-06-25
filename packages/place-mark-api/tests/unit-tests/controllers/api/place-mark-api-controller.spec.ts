import { ServerInjectResponse } from "@hapi/hapi";
import { assert } from "chai";
import { IPaginatedListRequest, IPaginatedListResponse, IPlaceMarkReadOnlyDto } from "../../../../app/core/dtos/index.js";
import { IPlaceMarkRepository } from "../../../../app/repositories/interfaces/index.js";
import { QueryParams, toQueryString } from "../../../utils.js";
import { IValidationResult } from "../../../../app/core/index.js";
import { UnitTestFixture } from "../unit-test-fixture.js";

suite("PlaceMarkApiController Unit-Tests", () => {
  let fixture: UnitTestFixture;
  let token: string;

  setup(async () => {
    fixture = new UnitTestFixture();
    await fixture.start$();
    token = fixture.authValidator.add({ id: "some-id", email: "admin@admin.com", admin: false });
  });

  teardown(async () => {
    await fixture.stop$();
  });

  suite("GET /api/place-mark Tests", () => {
    test("auth should work", async () => {
      const response = await fixture.inject({
        method: "GET",
        url: "/api/place-mark",
      });

      assert.equal(response.statusCode, 401);
    });

    test("empty params should work", async () => {
      const mockedResult: IPaginatedListResponse<IPlaceMarkReadOnlyDto> = {
        total: 0,
        data: [],
      };
      let repoCalled = false;
      fixture.container.placeMarkRepoMock = {
        get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IPlaceMarkReadOnlyDto>> {
          assert.isNotNull(listRequest);
          assert.isUndefined(listRequest.skip);
          assert.isUndefined(listRequest.take);
          if (repoCalled) {
            assert.fail("PlaceMarkRepository.get$ called twice.");
          }
          repoCalled = true;
          return Promise.resolve(mockedResult);
        },
      } as IPlaceMarkRepository;

      const response = await fixture.inject({
        method: "GET",
        url: "/api/place-mark",
        headers: {
          authorization: token,
        },
      });

      assert.equal(response.statusCode, 200);
      assert.isNotNull(response.result);
      assert.equal(response.result, mockedResult);
      assert.isTrue(repoCalled);
    });

    test("correct params should be extracted", async () => {
      const mockedResult: IPaginatedListResponse<IPlaceMarkReadOnlyDto> = {
        total: 0,
        data: [],
      };
      let repoCalled = 0;
      fixture.container.placeMarkRepoMock = {
        get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IPlaceMarkReadOnlyDto>> {
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
              assert.fail("PlaceMarkRepository.get$ called more than three times.");
              break;
          }
          // eslint-disable-next-line no-plusplus
          repoCalled++;
          return Promise.resolve(mockedResult);
        },
      } as IPlaceMarkRepository;

      const call$ = async (query: QueryParams) => {
        const response = await fixture.inject({
          method: "GET",
          url: `/api/place-mark?${toQueryString(query)}`,
          headers: {
            authorization: token,
          },
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
        const response: ServerInjectResponse<IValidationResult[]> = await fixture.inject({
          method: "GET",
          url: `/api/place-mark?${toQueryString(query)}`,
          headers: {
            Authorization: token,
          },
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

  suite("GET /api/place-mark/{id} Tests", () => {
    test("auth should work", async () => {
      const response = await fixture.inject({
        method: "GET",
        url: "/api/place-mark/646634e51d85e59154d725c5",
      });

      assert.equal(response.statusCode, 401);
    });

    test("should return 200 on success", async () => {
      const mockPlaceMark: IPlaceMarkReadOnlyDto = {
        id: "646634e51d85e59154d725c5",
        designation: "Tower Bridge",
        description: "240m tall",
        latitude: 51.5055,
        longitude: -0.075406,
        createdBy: {
          id: "446634e51d85e59154d725c5",
          designation: "Cookie Monster",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fixture.container.placeMarkRepoMock = {
        getById$(id: string): Promise<IPlaceMarkReadOnlyDto | null> {
          if (id !== "646634e51d85e59154d725c5") {
            assert.fail("Wrong id supplied");
          }

          return Promise.resolve(mockPlaceMark);
        },
      } as IPlaceMarkRepository;

      const response: ServerInjectResponse<IPlaceMarkReadOnlyDto> = await fixture.inject({
        method: "GET",
        url: "/api/place-mark/646634e51d85e59154d725c5",
        headers: {
          authorization: token,
        },
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.result, mockPlaceMark);
    });

    test("should return 404 on not found", async () => {
      fixture.container.placeMarkRepoMock = {
        getById$(id: string): Promise<IPlaceMarkReadOnlyDto | null> {
          assert.equal(id, "646634e51d85e59154d725c5");
          return Promise.resolve(null);
        },
      } as IPlaceMarkRepository;
      const response = await fixture.inject({
        method: "GET",
        url: "/api/place-mark/646634e51d85e59154d725c5",
        headers: {
          authorization: token,
        },
      });

      assert.equal(response.statusCode, 404);
    });
  });
});
