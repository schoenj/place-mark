import { IPaginatedListRequest, IPaginatedListResponse, IPlaceMarkCreateReadWriteDto, IPlaceMarkReadOnlyDto } from "../../core/dtos/index.js";

export interface IPlaceMarkRepository {
  /**
   * Saves a place-mark
   * @param placeMark
   */
  create$(placeMark: IPlaceMarkCreateReadWriteDto): Promise<string>;

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
