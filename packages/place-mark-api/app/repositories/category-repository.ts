import { Prisma } from "@prisma/client";
import { Repository } from "./repository.js";
import { ICategoryRepository } from "./interfaces/index.js";
import { ICategoryReadOnlyDto, IPaginatedListRequest, IPaginatedListResponse } from "../core/dtos/index.js";
import { categoryReadOnlyQuery, CategoryReadOnlySelectType } from "./queries/category-read-only.js";

export class CategoryRepository extends Repository implements ICategoryRepository {
  /**
   * Gets a paginated list of categories
   * @param listRequest List-Request
   */
  public async get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<ICategoryReadOnlyDto>> {
    const result = await this.paginate$(
      undefined,
      {
        designation: "asc",
      },
      categoryReadOnlyQuery.select,
      categoryReadOnlyQuery.transform,
      listRequest.skip,
      listRequest.take
    );

    return result;
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
   * Gets a paginated and filtered list
   * @param where Optional Where-Clause
   * @param orderBy Optional OrderBy
   * @param select Select-Clause
   * @param transform Method to map the database response to dto
   * @param skip The amount of records to skip
   * @param take The amount of records to load
   * @protected
   */
  protected async paginate$<TSelect extends Prisma.CategorySelect, TDto extends object>(
    where: Prisma.CategoryWhereInput | undefined,
    orderBy: Prisma.Enumerable<Prisma.CategoryOrderByWithRelationInput> | undefined,
    select: TSelect,
    transform: (entry: Prisma.CategoryGetPayload<{ select: TSelect }>) => TDto,
    skip?: number,
    take?: number
  ): Promise<IPaginatedListResponse<TDto>> {
    const [total, data]: [number, Prisma.CategoryGetPayload<{ select: TSelect }>[]] = await Promise.all([
      this.db.category.count({ where }),
      this.db.category.findMany({
        where: where,
        orderBy: orderBy,
        select: select,
        skip: skip || 0,
        take: take || 25,
      }),
    ]);

    return {
      total: total,
      data: data.map((x) => transform(x)),
    };
  }
}
