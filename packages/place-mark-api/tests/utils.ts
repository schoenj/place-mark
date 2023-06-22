import { Prisma, PrismaClient, User } from "@prisma/client";

export type QueryParams = { [key: string]: boolean | string | number | undefined | null };
export function toQueryString<T extends QueryParams>(object: T | undefined | null): string {
  if (object === undefined || object === null) {
    return "";
  }

  return Object.keys(object)
    .filter((prop) => object[prop] !== undefined)
    .map((prop) => ({
      prop: prop,
      value: (object[prop] === null ? "" : object[prop]) as boolean | string | number,
    }))
    .map((entry) => `${encodeURIComponent(entry.prop)}=${encodeURIComponent(entry.value)}`)
    .join("&");
}

export async function createUser$(client: PrismaClient, userData: Prisma.UserCreateInput): Promise<[string, string]> {
  const user: User = await client.user.create({ data: userData });
  return [user.id, user.email];
}
