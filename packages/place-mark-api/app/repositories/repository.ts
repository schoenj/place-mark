import { Prisma, PrismaClient } from "@prisma/client";
import { IPaginatedListResponse } from "../core/dtos/index.js";

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

  /**
   * Gets a paginated and filtered list
   * @param model The Model
   * @param where Optional Where-Clause
   * @param orderBy Optional OrderBy
   * @param select Select-Clause
   * @param transform Method to map the database response to dto
   * @param skip The amount of records to skip
   * @param take The amount of records to load
   * @protected
   */
  protected async paginate$<T1 extends Prisma.UserSelect, T2 extends object>(
    model: "user",
    where: Prisma.UserWhereInput | undefined,
    orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[] | undefined,
    select: T1,
    transform: (entry: Prisma.UserGetPayload<{ select: T1 }>) => T2,
    skip?: number,
    take?: number
  ): Promise<IPaginatedListResponse<T2>> {
    const [total, data]: [number, Prisma.UserGetPayload<{ select: typeof select }>[]] = await Promise.all([
      this.db[model].count({ where }),
      this.db[model].findMany({
        where,
        orderBy,
        select,
        skip: skip || 0,
        take: take || 25,
      }),
    ]);

    return {
      total: total,
      data: data.map((x) => transform(x)),
    };
  }
}
