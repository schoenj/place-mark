import { User } from "@prisma/client";
import { ICreateUserReadWriteDto, IPaginatedListRequest, IPaginatedListResponse, IUserReadOnlyDto } from "../core/dtos/index.js";
import { Repository } from "./repository.js";
import { userReadOnlyQuery, UserReadOnlySelectType } from "./queries/user-read-only.js";
import { IUserRepository } from "./interfaces/index.js";

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
        },
        {
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
  async getById$(id: string): Promise<IUserReadOnlyDto | null> {
    const user: UserReadOnlySelectType | null = await this.db.user.findUnique({
      where: {
        id: id,
      },
      select: userReadOnlyQuery.select,
    });

    return user ? userReadOnlyQuery.transform(user) : null;
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

  /**
   * Deletes a user by its id
   * @param id The id
   */
  async deleteById$(id: string): Promise<void> {
    // See https://github.com/prisma/prisma/issues/4072
    // tldr:
    // - delete throws an error, if the object is not found
    // - deleteMany does not throw any error, but cascades are a problem
    // - deleteIfExists is planned
    // => We need to check first, until deleteIfExists is implemented

    const count = await this.db.user.count({
      where: { id: id },
    });

    if (count === 1) {
      await this.db.user.delete({
        where: {
          id: id,
        },
      });
    }
  }
}
