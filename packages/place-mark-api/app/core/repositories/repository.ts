import { PrismaClient } from "@prisma/client";

export abstract class Repository {
  /**
   * Initializes a new instance of the Repository-Class
   * @param _prisma Prisma Client
   */
  constructor(private _prisma: PrismaClient) {}

  /**
   * Gets the Prisma Client
   */
  public get db(): PrismaClient {
    return this._prisma;
  }
}
