import { Category, User } from "@prisma/client";
import { assert } from "chai";
import { CategoryRepository } from "../../../app/repositories/index.js";
import { RepositoryTestFixture } from "./repository-test-fixture.js";
import { cookieMonsterUser } from "../../fixtures.js";
import { ICategoryReadOnlyDto, ICategoryReadWriteDto } from "../../../app/core/dtos/index.js";
import { BusinessException } from "../../../app/core/business-exception.js";

suite("CategoryRepository Integration Tests", () => {
  let fixture: RepositoryTestFixture<CategoryRepository>;
  let user: User;
  let cmp: (expected: Category, actual: ICategoryReadOnlyDto) => void;

  setup(async () => {
    fixture = new RepositoryTestFixture<CategoryRepository>((client) => new CategoryRepository(client));
    await fixture.start$();
    user = await fixture.createUser$(cookieMonsterUser);
    cmp = (expected, actual) => {
      assert.isNotNull(actual);
      assert.equal(actual.id, expected.id);
      assert.equal(actual.designation, expected.designation);
      assert.isNotNull(actual.createdBy);
      assert.equal(actual.createdBy.id, user.id);
      assert.equal(actual.createdBy.designation, `${user.firstName} ${user.lastName}`);
      assert.equal(actual.createdAt.toUTCString(), expected.createdAt.toUTCString());
      assert.equal(actual.updatedAt.toUTCString(), expected.updatedAt.toUTCString());
    };
  });

  teardown(async () => {
    await fixture.stop$();
  });

  test("create$ should work", async () => {
    // Business Exception should be thrown
    try {
      await fixture.repository.create$({
        designation: "Bridge",
        createdById: undefined,
      });
      assert.fail("BusinessException should be thrown");
    } catch (ex) {
      assert.instanceOf(ex, BusinessException);
      const businessException = ex as BusinessException;
      assert.equal(businessException.entity, "Category");
      assert.include(businessException.message, "createdById");
    }

    // User does not exist
    try {
      await fixture.repository.create$({
        designation: "Bridge",
        createdById: "646634e51d85e59154d725c5",
      });
      assert.fail("Database Exception should be thrown");
    } catch (ex) {
      assert.instanceOf(ex, BusinessException);
      const businessException = ex as BusinessException;
      assert.equal(businessException.entity, "User");
      assert.include(businessException.message, "not found");
    }

    // Success
    const id = await fixture.repository.create$({
      designation: "Bridge",
      createdById: user.id,
    });
    const category = await fixture.prisma.category.findUnique({ where: { id: id } });
    assert.isNotNull(category);
    assert.equal(category?.designation, "Bridge");
    assert.equal(category?.createdById, user.id);
  });

  test("getById$ should work", async () => {
    await fixture.testGetById$(
      () =>
        fixture.prisma.category.create({
          data: {
            designation: "Bridge",
            createdById: user.id,
            placeMarks: {
              create: {
                designation: "Tower Bridge",
                latitude: 1,
                longitude: 2,
                createdById: user.id,
              },
            },
          },
        }),
      (repo, id) => repo.getById$(id),
      (expected, actual) => {
        cmp(expected, actual);
        assert.equal(actual.placeMarks.length, 1);
        const placeMark = actual.placeMarks[0];
        assert.equal(placeMark.latitude, 1);
        assert.equal(placeMark.longitude, 2);
        assert.equal(placeMark.designation, "Tower Bridge");
      }
    );
  });

  test("get$ should work", async () => {
    const categories = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const designation of ["b", "a", "e", "c", "d"]) {
      // eslint-disable-next-line no-await-in-loop
      const category = await fixture.prisma.category.create({
        data: {
          designation: designation,
          createdById: user.id,
        },
      });
      categories.push(category);
    }

    await fixture.testPaginate$(
      (repo, skip, take) => repo.get$({ skip, take }),
      categories,
      cmp,
      (a, b) => (a.designation > b.designation ? 1 : -1)
    );
  });

  test("update$ should work", async () => {
    await fixture.testUpdate$(
      () => fixture.prisma.category.create({ data: { createdById: user.id, designation: "Bridge" } }),
      "Category",
      { designation: "Bridge New" } as ICategoryReadWriteDto,
      (repo, dto) => repo.update$(dto),
      (id) => fixture.prisma.category.findUnique({ where: { id: id } }),
      (created, updated, dto) => {
        assert.equal(updated.id, created.id);
        assert.equal(updated.createdById, created.createdById);
        assert.equal(updated.createdAt.toUTCString(), created.createdAt.toUTCString());
        assert.equal(updated.designation, dto.designation);
      }
    );
  });

  test("deleteById$ should work", async () => {
    const create$ = () =>
      fixture.prisma.category.create({
        data: {
          designation: "Bridge",
          createdById: user.id,
        },
      });

    await fixture.testDeleteById$(
      create$,
      (repo, id) => repo.deleteById$(id),
      async (id) => {
        const found = await fixture.prisma.category.count({ where: { id: id } });
        return !!found;
      }
    );

    const created = await create$();
    await fixture.prisma.placeMark.create({
      data: {
        designation: "Tower Bridge",
        description: "Built between 1886 and 1894, designed by Horace Jones and engineered by John Wolfe Barry.",
        latitude: 51.50546124603717,
        longitude: -0.07539259117490767,
        createdById: user.id,
        categoryId: created.id,
      },
    });
    try {
      await fixture.repository.deleteById$(created.id);
      assert.fail("Should have thrown an exception");
    } catch (ex) {
      assert.instanceOf(ex, BusinessException);
      const bEx = ex as BusinessException;
      assert.equal(bEx.entity, "Category");
      assert.include(bEx.message, "in use");
    }
  });
});
