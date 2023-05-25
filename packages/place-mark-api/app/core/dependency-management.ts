import { PrismaClient } from "@prisma/client";
import { Request, ResponseToolkit, Server } from "@hapi/hapi";
import { IUserRepository, UserRepository } from "./repositories/index.js";

/**
 * Declares methods and properties for managing dependencies.
 */
export interface IContainer {
  /**
   * Gets the PrismaClient for interacting with the Database
   */
  get db(): PrismaClient;

  /**
   * Gets the User-Repository
   */
  get userRepository(): IUserRepository;
}

/**
 * Implements methods and properties for managing dependencies.
 */
export class Container implements IContainer {
  private _userRepository: IUserRepository | null;

  /**
   * Initializes a new instance of the Container-Class
   * @param _prisma The Prisma Client
   */
  constructor(private _prisma: PrismaClient) {}

  /**
   * Gets the Prisma Client
   */
  public get db(): PrismaClient {
    return this._prisma;
  }

  /**
   * Gets the User-Repository
   */
  public get userRepository(): IUserRepository {
    this._userRepository = this._userRepository || new UserRepository(this.db);
    return this._userRepository;
  }
}

declare module "@hapi/hapi" {
  /**
   * Extends the @hapi Request-Object to configure a container
   */
  interface Request {
    /**
     * Gets the container
     */
    container: IContainer;
  }
}

/**
 * Configures the Hapi Server to initiate a container on every request
 *
 * @param server The Server to configure
 * @param prisma The Prisma Client
 * @param containerFactory A function that creates the Container
 */
export function registerDependencyManagement(server: Server, prisma: PrismaClient, containerFactory: (prisma: PrismaClient) => IContainer): void {
  server.ext("onRequest", async (request: Request, h: ResponseToolkit) => {
    request.container = containerFactory(prisma);
    return h.continue;
  });
}
