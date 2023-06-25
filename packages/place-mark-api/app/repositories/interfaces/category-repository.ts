import { ICategoryReadOnlyDto, IPaginatedListRequest, IPaginatedListResponse } from "../../core/dtos/index.js";

export interface ICategoryRepository {
  /**
   * Gets a category by its id
   * @param id the id
   */
  getById$(id: string): Promise<ICategoryReadOnlyDto | null>;

  /**
   * Gets a paginated list of categories
   * @param listRequest List-Request
   */
  get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<ICategoryReadOnlyDto>>;
}
