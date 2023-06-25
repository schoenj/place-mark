import { Category, PlaceMark, User } from "@prisma/client";
import { assert } from "chai";
import { PlaceMarkRepository } from "../../../app/repositories/index.js";
import { cookieMonsterUser } from "../../fixtures.js";
import { RepositoryTestFixture } from "./repository-test-fixture.js";
import { IPlaceMarkReadOnlyDto } from "../../../app/core/dtos/index.js";

suite("PlaceMarkRepository Integration Tests", () => {
  let fixture: RepositoryTestFixture<PlaceMarkRepository>;
  let user: User;
  let category: Category;
  let cmp: (expected: PlaceMark, actual: IPlaceMarkReadOnlyDto) => void;

  setup(async () => {
    fixture = new RepositoryTestFixture<PlaceMarkRepository>((client) => new PlaceMarkRepository(client));
    await fixture.start$();
    user = await fixture.createUser$(cookieMonsterUser);
    category = await fixture.prisma.category.create({
      data: {
        createdById: user.id,
        designation: "landscape",
      },
    });
    cmp = (expected, actual) => {
      assert.isNotNull(actual);
      assert.equal(actual.id, expected.id);
      assert.equal(actual?.designation, expected.designation);
      assert.equal(actual?.description, expected.description);
      assert.equal(actual?.latitude, expected.latitude);
      assert.equal(actual?.longitude, expected.longitude);
      assert.equal(actual.createdAt.toUTCString(), expected.createdAt.toUTCString());
      assert.equal(actual.updatedAt.toUTCString(), expected.updatedAt.toUTCString());
      assert.equal(actual?.createdBy?.id, user.id);
      assert.equal(actual?.createdBy?.designation, `${user.firstName} ${user.lastName}`);
      assert.isNotNull(actual?.category);
      assert.equal(actual?.category.id, category.id);
      assert.equal(actual?.category.designation, category.designation);
    };
  });

  teardown(async () => {
    await fixture.stop$();
  });

  test("getById$ should work", async () => {
    await fixture.testGetById$(
      () =>
        fixture.prisma.placeMark.create({
          data: {
            designation: "Tower Bridge",
            description: "Built between 1886 and 1894, designed by Horace Jones and engineered by John Wolfe Barry.",
            latitude: 51.50546124603717,
            longitude: -0.07539259117490767,
            createdById: user.id,
            categoryId: category.id,
          },
        }),
      (repo, id) => repo.getById$(id),
      cmp
    );
  });

  test("get$ should work", async () => {
    const placeMarks = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const designation of ["b", "a", "e", "c", "d"]) {
      // eslint-disable-next-line no-await-in-loop
      const placeMark = await fixture.prisma.placeMark.create({
        data: {
          designation: designation,
          description: `Description for ${designation}`,
          latitude: Math.random(),
          longitude: Math.random(),
          createdById: user.id,
          categoryId: category.id,
        },
      });
      placeMarks.push(placeMark);
    }

    await fixture.testPaginate$(
      (repo, skip, take) => repo.get$({ skip, take }),
      placeMarks,
      cmp,
      (a, b) => (a.designation > b.designation ? 1 : -1)
    );
  });
});
