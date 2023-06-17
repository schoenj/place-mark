import { User } from "@prisma/client";
import { ICreateUserReadWriteDto, IPaginatedListRequest, IPaginatedListResponse, IUserReadOnlyDto } from "../dtos/index.js";
import { Repository } from "./repository.js";
import { userReadOnlyQuery } from "./queries/user-read-only.js";

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
  getById$(id: string): Promise<User | null>;

  /**
   * Loads a paginated list of users
   * @param listRequest The List-Request
   */
  get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IUserReadOnlyDto>>;
}

export class UserRepository extends Repository implements IUserRepository {
  /**
   * Loads a paginated list of users
   * @param listRequest The List-Request
   */
  async get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IUserReadOnlyDto>> {
    const result = await this.paginate$(
      "user",
      undefined,
      [
        {
          firstName: "asc",
          lastName: "asc",
        },
      ],
      userReadOnlyQuery.select,
      userReadOnlyQuery.transform,
      listRequest.skip,
      listRequest.take
    );

    return result;
  }

  /**
   * Gets a user by its email address
   * @param email The email address
   */
  async getByEmail$(email: string): Promise<User | null> {
    const user: User | null = await this.db.user.findUnique({
      where: {
        // findUnique does not support the insensitive mode
        email: email.toLowerCase(),
      },
    });

    return user;
  }

  /**
   * Gets a user by its id
   * @param id The id
   */
  async getById$(id: string): Promise<User | null> {
    const user: User | null = await this.db.user.findUnique({
      where: {
        id: id,
      },
    });

    return user;
  }

  /**
   * Creates a new user
   * @param user The user to create
   */
  async create$(user: ICreateUserReadWriteDto): Promise<User> {
    const created: User = await this.db.user.create({
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email.toLowerCase(),
        password: user.password,
      },
    });

    return created;
  }
}
