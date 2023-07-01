import { User } from "@prisma/client";
import { ICreateUserReadWriteDto, IPaginatedListRequest, IPaginatedListResponse, IUserDetailsDto, IUserReadOnlyDto } from "../core/dtos/index.js";
import { Repository } from "./repository.js";
import { userReadOnlyQuery, UserReadOnlySelectType } from "./queries/user-read-only.js";
import { IUserRepository } from "./interfaces/index.js";
import { userDetailsQuery } from "./queries/user-details.js";

export class UserRepository extends Repository implements IUserRepository {
  /**
   * Creates a new user
   * @param user The user to create
   */
  public async create$(user: ICreateUserReadWriteDto): Promise<User> {
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
   * Loads a paginated list of users
   * @param listRequest The List-Request
   */
  public async get$(listRequest: IPaginatedListRequest): Promise<IPaginatedListResponse<IUserReadOnlyDto>> {
    const total = await this.db.user.count();
    const data = await this.db.user.findMany({
      select: userReadOnlyQuery.select,
      orderBy: [
        {
          firstName: "asc",
        },
        {
          lastName: "asc",
        },
      ],
      skip: listRequest?.skip || 0,
      take: listRequest?.take || 25,
    });

    return {
      total: total,
      data: data.map((x) => userReadOnlyQuery.transform(x)),
    };
  }

  /**
   * Gets a user by its email address
   * @param email The email address
   */
  public async getByEmail$(email: string): Promise<User | null> {
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
  public async getById$(id: string): Promise<IUserReadOnlyDto | null> {
    const user: UserReadOnlySelectType | null = await this.db.user.findUnique({
      where: {
        id: id,
      },
      select: userReadOnlyQuery.select,
    });

    return user ? userReadOnlyQuery.transform(user) : null;
  }

  /**
   * Gets the details of a user
   * @param id The id
   */
  public async getDetailsById$(id: string): Promise<IUserDetailsDto | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: id,
      },
      select: userDetailsQuery.select,
    });

    return user ? userDetailsQuery.transform(user) : null;
  }

  /**
   * Updates the Email of a user
   * @param id the id of a user
   * @param email the new email
   */
  public async updateEmail$(id: string, email: string): Promise<void> {
    await this.db.user.update({
      where: {
        id: id,
      },
      data: {
        email: email.toLowerCase(),
      },
    });
  }

  /**
   * Updates the Password of a user
   * @param id the id of a user
   * @param password the new password
   */
  public async updatePassword$(id: string, password: string): Promise<void> {
    await this.db.user.update({
      where: {
        id: id,
      },
      data: {
        password: password,
      },
    });
  }

  /**
   * Deletes a user by its id
   * @param id The id
   */
  public async deleteById$(id: string): Promise<void> {
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
