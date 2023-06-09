import { User } from "@prisma/client";
import { ICreateUserReadWriteDto, IPaginatedListRequest, IPaginatedListResponse, IUserDetailsDto, IUserReadOnlyDto } from "../../core/dtos/index.js";

export interface IUserRepository {
  /**
   * Gets a user by its email address
   * @param email The email address
   */
  getByEmail$(email: string): Promise<User | null>;

  /**
   * Creates a new user
   * @param user The user to create
   */
  create$(user: ICreateUserReadWriteDto): Promise<User>;

  /**
   * Gets a user by its id
   * @param id The id
   */
  getById$(id: string): Promise<IUserReadOnlyDto | null>;

  /**
   * Loads a paginated list of users
   * @param listRequest The List-Request
   */
  get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IUserReadOnlyDto>>;

  /**
   * Updates the Password of a user
   * @param id the id of a user
   * @param password the new password
   */
  updatePassword$(id: string, password: string): Promise<void>;

  /**
   * Updates the Email of a user
   * @param id the id of a user
   * @param email the new email
   */
  updateEmail$(id: string, email: string): Promise<void>;

  /**
   * Gets the details of a user
   * @param id The id
   */
  getDetailsById$(id: string): Promise<IUserDetailsDto | null>;

  /**
   * Deletes a user by its id
   * @param id The id
   */
  deleteById$(id: string): Promise<void>;
}
