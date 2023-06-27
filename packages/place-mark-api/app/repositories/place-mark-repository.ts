import { Category, Prisma } from "@prisma/client";
import { IPlaceMarkRepository } from "./interfaces/index.js";
import { Repository } from "./repository.js";
import { IPaginatedListRequest, IPaginatedListResponse, IPlaceMarkCreateReadWriteDto, IPlaceMarkReadOnlyDto } from "../core/dtos/index.js";
import { placeMarkReadOnlyQuery, PlaceMarkReadOnlySelectType } from "./queries/place-mark-read-only.js";
import { BusinessException } from "../core/business-exception.js";

export class PlaceMarkRepository extends Repository implements IPlaceMarkRepository {
  /**
   * Saves a place-mark
   * @param placeMark
   */
  async create$(placeMark: IPlaceMarkCreateReadWriteDto): Promise<string> {
    if (placeMark.createdById === null || placeMark.createdById === undefined) {
      throw new BusinessException("Category", "createdById is not set.");
    }

    const userCount = await this.db.user.count({ where: { id: placeMark.createdById } });
    if (userCount !== 1) {
      throw new BusinessException("User", `User not found. Id: ${placeMark.createdById}`);
    }

    const categoryCount = await this.db.category.count({ where: { id: placeMark.categoryId } });
    if (categoryCount !== 1) {
      throw new BusinessException("Category", `Category not found. Id: ${placeMark.categoryId}`);
    }

    const result: Category = await this.db.placeMark.create({
      data: {
        designation: placeMark.designation,
        description: placeMark.description,
        latitude: placeMark.latitude,
        longitude: placeMark.longitude,
        categoryId: placeMark.categoryId,
        createdById: placeMark.createdById,
      },
    });

    return result.id;
  }

  /**
   * Gets a place-mark by its id
   * @param id The id
   */
  async getById$(id: string): Promise<IPlaceMarkReadOnlyDto | null> {
    const placeMark: PlaceMarkReadOnlySelectType | null = await this.db.placeMark.findUnique({
      where: {
        id: id,
      },
      select: placeMarkReadOnlyQuery.select,
    });

    return placeMark ? placeMarkReadOnlyQuery.transform(placeMark) : null;
  }

  /**
   * Gets a paginated list of place-marks
   * @param listRequest List-Request
   */
  async get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IPlaceMarkReadOnlyDto>> {
    const result = await this.paginate$(
      undefined,
      {
        designation: "asc",
      },
      placeMarkReadOnlyQuery.select,
      placeMarkReadOnlyQuery.transform,
      listRequest.skip,
      listRequest.take
    );

    return result;
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
  protected async paginate$<TSelect extends Prisma.PlaceMarkSelect, TDto extends object>(
    where: Prisma.PlaceMarkWhereInput | undefined,
    orderBy: Prisma.Enumerable<Prisma.PlaceMarkOrderByWithRelationInput> | undefined,
    select: TSelect,
    transform: (entry: Prisma.PlaceMarkGetPayload<{ select: TSelect }>) => TDto,
    skip?: number,
    take?: number
  ): Promise<IPaginatedListResponse<TDto>> {
    const [total, data]: [number, Prisma.PlaceMarkGetPayload<{ select: TSelect }>[]] = await Promise.all([
      this.db.placeMark.count({ where }),
      this.db.placeMark.findMany({
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
