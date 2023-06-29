import {
  ICategoryCreateReadWriteDto,
  ICategoryReadOnlyDto,
  ICategoryReadWriteDto,
  IPaginatedListRequest,
  IPaginatedListResponse
} from "../../core/dtos/index.js";

export interface ICategoryRepository {
  /**
   * Saves a Category
   * @param category
   */
  create$(category: ICategoryCreateReadWriteDto): Promise<string>;

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

  /**
   * Updates a category
   * @param category The updated category
   */
  update$(category: ICategoryReadWriteDto): Promise<void>;

  /**
   * Deletes a category by its id
   * @param id The id
   */
  deleteById$(id: string): Promise<void>;
}
