import { Category, PlaceMark, PrismaClient } from "@prisma/client";
import { assert } from "chai";
import { PlaceMarkRepository } from "../../../app/repositories/index.js";
import { createUser$ } from "../../utils.js";
import { cookieMonsterUser } from "../../fixtures.js";

suite("PlaceMarkRepository Integration Tests", () => {
  let prismaClient: PrismaClient;
  let repository: PlaceMarkRepository;
  let cookieMonsterId: string;
  let category: Category;

  setup(async () => {
    prismaClient = new PrismaClient();
    await prismaClient.$connect();
    repository = new PlaceMarkRepository(prismaClient);
    [cookieMonsterId] = await createUser$(prismaClient, cookieMonsterUser);
    category = await prismaClient.category.create({
      data: {
        createdById: cookieMonsterId,
        designation: "landscape",
      },
    });
  });

  teardown(async () => {
    await prismaClient.placeMark.deleteMany();
    await prismaClient.category.deleteMany();
    await prismaClient.user.deleteMany();
    await prismaClient.$disconnect();
  });

  test("getById$ should work", async () => {
    const placeMark = await prismaClient.placeMark.create({
      data: {
        designation: "Tower Bridge",
        description: "Built between 1886 and 1894, designed by Horace Jones and engineered by John Wolfe Barry.",
        latitude: 51.50546124603717,
        longitude: -0.07539259117490767,
        createdById: cookieMonsterId,
        categoryId: category.id,
      },
    });

    const dto = await repository.getById$(placeMark.id);
    assert.isNotNull(dto);
    assert.equal(dto?.designation, "Tower Bridge");
    assert.equal(dto?.description, "Built between 1886 and 1894, designed by Horace Jones and engineered by John Wolfe Barry.");
    assert.equal(dto?.latitude, 51.50546124603717);
    assert.equal(dto?.longitude, -0.07539259117490767);
    assert.isNotNull(dto?.createdAt);
    assert.isNotNull(dto?.updatedAt);
    assert.isNotNull(dto?.createdBy);
    assert.equal(dto?.createdBy?.id, cookieMonsterId);
    assert.equal(dto?.createdBy?.designation, "Cookie Monster");
    assert.isNotNull(dto?.category);
    assert.equal(dto?.category.id, category.id);
    assert.equal(dto?.category.designation, category.designation);
  });

  suite("get$ should work", () => {
    let placeMarks: PlaceMark[];

    setup(async () => {
      placeMarks = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const designation of ["b", "a", "e", "c", "d"]) {
        // eslint-disable-next-line no-await-in-loop
        const placeMark = await prismaClient.placeMark.create({
          data: {
            designation: designation,
            description: `Description for ${designation}`,
            latitude: Math.random(),
            longitude: Math.random(),
            createdById: cookieMonsterId,
            categoryId: category.id,
          },
        });
        placeMarks.push(placeMark);
      }
    });

    test("skip should work", async () => {
      let result = await repository.get$({ skip: 0 });
      assert.isNotNull(result);
      assert.equal(result.total, placeMarks.length);
      assert.equal(result.data.length, 5);

      result = await repository.get$({ skip: 4 });
      assert.isNotNull(result);
      assert.equal(result.total, placeMarks.length);
      assert.equal(result.data.length, 1);

      result = await repository.get$({ skip: 9999 });
      assert.isNotNull(result);
      assert.equal(result.total, placeMarks.length);
      assert.equal(result.data.length, 0);
    });

    test("take should work", async () => {
      let result = await repository.get$({ take: 5 });
      assert.equal(result.total, placeMarks.length);
      assert.equal(result.data.length, 5);

      result = await repository.get$({ take: 4 });
      assert.equal(result.total, placeMarks.length);
      assert.equal(result.data.length, 4);

      result = await repository.get$({ take: 1 });
      assert.equal(result.total, placeMarks.length);
      assert.equal(result.data.length, 1);

      result = await repository.get$({ take: 9999 });
      assert.equal(result.total, placeMarks.length);
      assert.equal(result.data.length, 5);
    });

    test("order should work", async () => {
      let result = await repository.get$({});
      assert.isNotNull(result);
      let designations = result.data.map((x) => x.designation);
      assert.equal(designations[0], "a");
      assert.equal(designations[1], "b");
      assert.equal(designations[2], "c");
      assert.equal(designations[3], "d");
      assert.equal(designations[4], "e");

      result = await repository.get$({ skip: 2 });
      designations = result.data.map((x) => x.designation);
      assert.isNotNull(result);
      assert.equal(designations[0], "c");
      assert.equal(designations[1], "d");
      assert.equal(designations[2], "e");
    });

    test("select should work", async () => {
      const result = await repository.get$({ take: 1 });
      assert.isNotNull(result);
      const actual = result.data[0];
      assert.isNotNull(actual);

      const expected = placeMarks.find((x) => x.id === result.data[0].id);
      assert.isNotNull(expected);

      assert.equal(actual.designation, expected?.designation);
      assert.equal(actual.description, expected?.description);
      assert.equal(actual.latitude, expected?.latitude);
      assert.equal(actual.longitude, expected?.longitude);
      assert.isNotNull(actual.createdBy);
      assert.equal(actual?.createdBy?.id, expected?.createdById);
      assert.equal(actual?.createdBy?.designation, "Cookie Monster");
      assert.equal(actual?.updatedAt.toUTCString(), expected?.updatedAt.toUTCString());
      assert.equal(actual?.createdAt.toUTCString(), expected?.createdAt.toUTCString());
      assert.isNotNull(actual?.category);
      assert.equal(actual?.category.id, category.id);
      assert.equal(actual?.category.designation, category.designation);
    });
  });
});
