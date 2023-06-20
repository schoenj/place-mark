import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "../../repositories/interfaces/index.js";
import { IAuthService } from "../../services/interfaces/index.js";

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

  /**
   * Gets the Auth-Service
   */
  get authService(): IAuthService;
}
