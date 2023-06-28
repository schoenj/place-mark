import { assert } from "chai";
import { IPaginatedListResponse, IPlaceMarkCreateReadWriteDto, IPlaceMarkReadOnlyDto } from "../../../../app/core/dtos/index.js";
import { IPlaceMarkRepository } from "../../../../app/repositories/interfaces/index.js";
import { UnitTestFixture } from "../unit-test-fixture.js";

suite("PlaceMarkApiController Unit-Tests", () => {
  let fixture: UnitTestFixture;

  setup(async () => {
    fixture = new UnitTestFixture();
    await fixture.start$();
  });

  teardown(async () => {
    await fixture.stop$();
  });

  test("POST /api/place-mark should work", async () => {
    const mockUserId = "646634e51d85e59154d745c5";
    const mockCatId = "77734e51d85e59154d745c5";
    const mockId = "88834e51d85e59154d745c5";
    const mockResult: IPlaceMarkReadOnlyDto = {
      id: mockId,
      designation: "Tower Bridge",
      category: {
        id: mockCatId,
        designation: "Bridge",
      },
      latitude: 51.5055,
      longitude: -0.075406,
      description: "Part of the City of London",
      createdBy: {
        id: mockUserId,
        designation: "Test",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let createCounter = 0;
    let getCounter = 0;
    fixture.container.placeMarkRepoMock = {
      create$(placeMark: IPlaceMarkCreateReadWriteDto): Promise<string> {
        assert.isNotNull(placeMark);
        assert.equal(placeMark.designation, "Tower Bridge");
        assert.equal(placeMark.createdById, mockUserId);
        assert.equal(placeMark.description, "Part of the City of London");
        assert.equal(placeMark.latitude, 51.5055);
        assert.equal(placeMark.longitude, -0.075406);
        // eslint-disable-next-line no-plusplus
        createCounter++;
        return Promise.resolve(mockId);
      },
      getById$(id: string): Promise<IPlaceMarkReadOnlyDto | null> {
        assert.equal(id, mockId);
        // eslint-disable-next-line no-plusplus
        getCounter++;
        return Promise.resolve(mockResult);
      },
    } as IPlaceMarkRepository;

    // No Authentication
    const payload = {
      designation: "Tower Bridge",
      description: "Part of the City of London",
      latitude: 51.5055,
      longitude: -0.075406,
      categoryId: mockCatId,
    };
    let response = await fixture.inject({
      method: "POST",
      url: "/api/place-mark",
      payload: payload,
    });
    assert.equal(response.statusCode, 401);
    assert.equal(createCounter, 0);
    assert.equal(getCounter, 0);

    // Authenticated
    const token = fixture.authValidator.add({ id: mockUserId, admin: false, email: "test@test.de" });
    response = await fixture.inject({
      method: "POST",
      url: "/api/place-mark",
      payload: payload,
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
    assert.equal(location, `/api/place-mark/${mockId}`);
  });

  test("GET /api/place-mark should work", async () => {
    const mockedResult: IPaginatedListResponse<IPlaceMarkReadOnlyDto> = {
      total: 0,
      data: [],
    };
    await fixture.testGet$(mockedResult, "place-mark", (container, mock) => {
      container.placeMarkRepoMock = {
        get$: mock,
      } as IPlaceMarkRepository;
    });
  });

  test("GET /api/place-mark/{id} should work", async () => {
    await fixture.testGetById$(
      {
        id: "746634e51d85e59154d725c5",
        designation: "Tower Bridge",
        category: {
          id: "546634e51d85e59154d725c5",
          designation: "Bridge",
        },
        latitude: 51.5055,
        longitude: -0.075406,
        description: "Part of the City of London",
        createdBy: {
          id: "646634e51d85e59154d725c5",
          designation: "Test",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      "place-mark",
      (container, mock) => {
        container.placeMarkRepoMock = {
          getById$: mock,
        } as IPlaceMarkRepository;
      }
    );
  });

  test("DELETE /api/place-mark/{id} should work", async () => {
    await fixture.testDeleteById("place-mark", (container, mock) => {
      container.placeMarkRepoMock = { deleteById$: mock } as IPlaceMarkRepository;
    });
  });
});
