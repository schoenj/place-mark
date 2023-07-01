import { Category } from "@prisma/client";
import { Repository } from "./repository.js";
import { ICategoryRepository } from "./interfaces/index.js";
import {
  ICategoryCreateReadWriteDto,
  ICategoryDetailsDto,
  ICategoryReadOnlyDto,
  ICategoryReadWriteDto,
  ILookupDto,
  IPaginatedListRequest,
  IPaginatedListResponse,
} from "../core/dtos/index.js";
import { categoryReadOnlyQuery } from "./queries/category-read-only.js";
import { BusinessException } from "../core/business-exception.js";
import { categoryDetailsQuery } from "./queries/category-details.js";

export class CategoryRepository extends Repository implements ICategoryRepository {
  /**
   * Saves a Category
   * @param category
   */
  public async create$(category: ICategoryCreateReadWriteDto): Promise<string> {
    if (category.createdById === null || category.createdById === undefined) {
      throw new BusinessException("Category", "createdById is not set.");
    }

    const userCount = await this.db.user.count({ where: { id: category.createdById } });
    if (userCount !== 1) {
      throw new BusinessException("User", `User not found. Id: ${category.createdById}`);
    }

    const result: Category = await this.db.category.create({
      data: {
        designation: category.designation,
        createdById: category.createdById,
      },
    });

    return result.id;
  }

  /**
   * Gets a paginated list of categories
   * @param listRequest List-Request
   */
  public async get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<ICategoryReadOnlyDto>> {
    const total = await this.db.category.count();
    const data = await this.db.category.findMany({
      orderBy: {
        designation: "asc",
      },
      select: categoryReadOnlyQuery.select,
      skip: listRequest?.skip || 0,
      take: listRequest?.take || 25,
    });

    return {
      total: total,
      data: data.map((x) => categoryReadOnlyQuery.transform(x)),
    };
  }

  /**
   * Gets a category by its id
   * @param id the id
   */
  public async getById$(id: string): Promise<ICategoryDetailsDto | null> {
    const category = await this.db.category.findUnique({
      where: {
        id: id,
      },
      select: categoryDetailsQuery.select,
    });

    return category ? categoryDetailsQuery.transform(category) : null;
  }

  /**
   * Get all categories as lookup
   */
  public async getLookup$(): Promise<ILookupDto[]> {
    const categories = await this.db.category.findMany({
      select: {
        id: true,
        designation: true,
      },
    });

    return categories;
  }

  /**
   * Updates a category
   * @param category The updated category
   */
  public async update$(category: ICategoryReadWriteDto): Promise<void> {
    const count = await this.db.category.count({ where: { id: category.id } });

    if (!count) {
      throw new BusinessException("Category", `Category not found. Id: ${category.id}`);
    }

    await this.db.category.update({
      where: {
        id: category.id,
      },
      data: {
        designation: category.designation,
      },
    });
  }

  /**
   * Deletes a category by its id
   * @param id The id
   */
  public async deleteById$(id: string): Promise<void> {
    // We need to check the existence first. See UserRepository
    const found = await this.db.category.findUnique({
      select: {
        _count: {
          select: {
            placeMarks: true,
          },
        },
      },
      where: {
        id: id,
      },
    });

    if (found) {
      if (found._count.placeMarks) {
        throw new BusinessException("Category", "Category is still in use.");
      }

      await this.db.category.delete({
        where: {
          id: id,
        },
      });
    }
  }
}
