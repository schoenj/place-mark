import { PrismaClient } from "@prisma/client";
import { IAuthService } from "../services/interfaces/index.js";
import { AuthService } from "../services/index.js";
import { IPlaceMarkRepository, IUserRepository } from "../repositories/interfaces/index.js";
import { IApplicationConfig } from "../config/interfaces/index.js";
import { UserRepository } from "../repositories/user-repository.js";
import { IContainer } from "./interfaces/index.js";
import { PlaceMarkRepository } from "../repositories/place-mark-repository.js";

/**
 * Implements methods and properties for managing dependencies.
 */
export class Container implements IContainer {
  private _userRepository: IUserRepository | null;

  private _placeMarkRepository: IPlaceMarkRepository | null;

  private _authService: IAuthService | null;

  /**
   * Initializes a new instance of the Container-Class
   * @param _config The Application-Config
   * @param _prisma The Prisma Client
   */
  constructor(private _config: IApplicationConfig, private _prisma: PrismaClient) {}

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

  public get placeMarkRepository(): IPlaceMarkRepository {
    this._placeMarkRepository = this._placeMarkRepository || new PlaceMarkRepository(this.db);
    return this._placeMarkRepository;
  }

  /**
   * Gets the Auth-Service
   */
  public get authService(): IAuthService {
    this._authService = this._authService || new AuthService(this._config, this.userRepository);
    return this._authService;
  }
}
