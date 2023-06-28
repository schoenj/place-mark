import { Category } from "@prisma/client";
import { Repository } from "./repository.js";
import { ICategoryRepository } from "./interfaces/index.js";
import { ICategoryCreateReadWriteDto, ICategoryReadOnlyDto, IPaginatedListRequest, IPaginatedListResponse } from "../core/dtos/index.js";
import { categoryReadOnlyQuery, CategoryReadOnlySelectType } from "./queries/category-read-only.js";
import { BusinessException } from "../core/business-exception.js";

export class CategoryRepository extends Repository implements ICategoryRepository {
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
  public async getById$(id: string): Promise<ICategoryReadOnlyDto | null> {
    const category: CategoryReadOnlySelectType | null = await this.db.category.findUnique({
      where: {
        id: id,
      },
      select: categoryReadOnlyQuery.select,
    });

    return category ? categoryReadOnlyQuery.transform(category) : null;
  }

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
}
