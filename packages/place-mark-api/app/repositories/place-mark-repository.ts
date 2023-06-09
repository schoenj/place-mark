import { Category } from "@prisma/client";
import { IPlaceMarkRepository } from "./interfaces/index.js";
import { Repository } from "./repository.js";
import {
  IPaginatedListRequest,
  IPaginatedListResponse,
  IPlaceMarkCreateReadWriteDto,
  IPlaceMarkLookupDto,
  IPlaceMarkReadOnlyDto,
  IPlaceMarkReadWriteDto,
} from "../core/dtos/index.js";
import { placeMarkReadOnlyQuery, PlaceMarkReadOnlySelectType } from "./queries/place-mark-read-only.js";
import { BusinessException } from "../core/business-exception.js";
import { placeMarkLookupQuery } from "./queries/place-mark-lookup.js";

export class PlaceMarkRepository extends Repository implements IPlaceMarkRepository {
  /**
   * Saves a place-mark
   * @param placeMark
   */
  public async create$(placeMark: IPlaceMarkCreateReadWriteDto): Promise<string> {
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
   * Get all place-marks as lookup
   */
  public async getLookup$(): Promise<IPlaceMarkLookupDto[]> {
    const placeMarks = await this.db.placeMark.findMany({
      select: placeMarkLookupQuery.select,
    });

    return placeMarks;
  }

  /**
   * Gets a place-mark by its id
   * @param id The id
   */
  public async getById$(id: string): Promise<IPlaceMarkReadOnlyDto | null> {
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
  public async get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IPlaceMarkReadOnlyDto>> {
    const total = await this.db.placeMark.count();
    const data = await this.db.placeMark.findMany({
      orderBy: {
        designation: "asc",
      },
      select: placeMarkReadOnlyQuery.select,
      skip: listRequest?.skip || 0,
      take: listRequest?.take || 25,
    });

    return {
      total: total,
      data: data.map((x) => placeMarkReadOnlyQuery.transform(x)),
    };
  }

  /**
   * Updates a place-mark
   * @param placeMark The updated place-mark
   */
  public async update$(placeMark: IPlaceMarkReadWriteDto): Promise<void> {
    const count = await this.db.placeMark.count({ where: { id: placeMark.id } });

    if (!count) {
      throw new BusinessException("PlaceMark", `PlaceMark not found: Id: ${placeMark.id}`);
    }

    await this.db.placeMark.update({
      where: {
        id: placeMark.id,
      },
      data: {
        designation: placeMark.designation,
        description: placeMark.description,
        latitude: placeMark.latitude,
        longitude: placeMark.longitude,
        categoryId: placeMark.categoryId,
      },
    });
  }

  /**
   * Delete a place-mark by its id
   * @param id The id
   */
  public async deleteById$(id: string): Promise<void> {
    // We need to check the existence first. See UserRepository
    const count = await this.db.placeMark.count({ where: { id: id } });

    if (count) {
      await this.db.placeMark.delete({
        where: {
          id: id,
        },
      });
    }
  }
}
