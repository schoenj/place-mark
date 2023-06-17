import { Repository } from "./repository.js";
import { IPlaceMarkReadOnlyDto, IPaginatedListRequest, IPaginatedListResponse } from "../dtos/index.js";
import { placeMarkReadOnlyQuery, PlaceMarkReadOnlySelectType } from "./queries/place-mark-read-only.js";

export interface IPlaceMarkRepository {
  /**
   * Gets a place-mark by its id
   * @param id The id
   */
  getById$(id: string): Promise<IPlaceMarkReadOnlyDto | null>;

  /**
   * Gets a paginated list of place-marks
   * @param listRequest List-Request
   */
  get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IPlaceMarkReadOnlyDto>>;
}

export class PlaceMarkRepository extends Repository implements IPlaceMarkRepository {
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
    const [total, data]: [number, PlaceMarkReadOnlySelectType[]] = await Promise.all([
      this.db.placeMark.count(),
      this.db.placeMark.findMany({
        select: placeMarkReadOnlyQuery.select,
        orderBy: {
          designation: "asc",
        },
        skip: listRequest.skip || 0,
        take: listRequest.take || 25,
      }),
    ]);

    return {
      data: data.map((x) => placeMarkReadOnlyQuery.transform(x)),
      total: total,
    };
  }
}
