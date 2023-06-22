import { ValidateResponse } from "@hapi/cookie";
import jwt, { SignOptions } from "jsonwebtoken";
import { AuthenticationResult, IAuthCredentials, IAuthenticatedUser, IAuthService } from "./interfaces/index.js";
import { IUserRepository } from "../repositories/interfaces/index.js";
import { IApplicationConfig } from "../config/interfaces/index.js";

export class AuthService implements IAuthService {
  constructor(private _config: IApplicationConfig, private _userRepository: IUserRepository) {}

  /**
   * Creates a bearer token
   * @param user The authenticated user
   */
  public createToken(user: IAuthenticatedUser): string {
    const options: SignOptions = {
      algorithm: this._config.jwt.algorithm,
      expiresIn: this._config.jwt.expiresIn,
    };
    return jwt.sign(user, this._config.jwt.password, options);
  }

  /**
   * Validates the user credentials
   * @param credentials The credentials
   */
  public async authenticate$<T extends IAuthCredentials>(credentials: T): Promise<AuthenticationResult> {
    const user = await this._userRepository.getByEmail$(credentials.email);

    if (user && user.password === credentials.password) {
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          admin: user.admin,
        },
      };
    }

    return { success: false };
  }

  /**
   * Validates the stored cookie or the jwt bearer token
   * @param cookieOrDecodedContent Either the stored cookie or the decoded jwt bearer token
   */
  public async validate$(cookieOrDecodedContent: object | undefined): Promise<ValidateResponse> {
    if (cookieOrDecodedContent && typeof cookieOrDecodedContent === "object" && "id" in cookieOrDecodedContent && typeof cookieOrDecodedContent.id === "string") {
      const user = await this._userRepository.getById$(cookieOrDecodedContent.id as string);

      if (user) {
        return {
          isValid: true,
          credentials: {
            user: user,
          },
        } as ValidateResponse;
      }
    }

    return { isValid: false };
  }
}
