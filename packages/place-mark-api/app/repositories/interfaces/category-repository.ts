import {
  ICategoryCreateReadWriteDto,
  ICategoryDetailsDto,
  ICategoryReadOnlyDto,
  ICategoryReadWriteDto,
  ILookupDto,
  IPaginatedListRequest,
  IPaginatedListResponse,
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
  getById$(id: string): Promise<ICategoryDetailsDto | null>;

  /**
   * Get all categories as lookup
   */
  getLookup$(): Promise<ILookupDto[]>;

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
