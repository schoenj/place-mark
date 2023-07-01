import {
  IPaginatedListRequest,
  IPaginatedListResponse,
  IPlaceMarkCreateReadWriteDto,
  IPlaceMarkReadOnlyDto,
  IPlaceMarkReadWriteDto
} from "../../core/dtos/index.js";

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

  /**
   * Updates a place-mark
   * @param placeMark The updated place-mark
   */
  update$(placeMark: IPlaceMarkReadWriteDto): Promise<void>;

  /**
   * Delete a place-mark by its id
   * @param id The id
   */
  deleteById$(id: string): Promise<void>;
}
