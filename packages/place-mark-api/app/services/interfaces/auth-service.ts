import { ValidateResponse } from "@hapi/cookie";

export interface IAuthenticatedUser {
  id: string;
  email: string;
  admin: boolean;
}

export type AuthenticationResult = { success: false } | { success: true; user: IAuthenticatedUser };

export interface IAuthCredentials {
  email: string;
  password: string;
}

export interface IAuthService {
  /**
   * Validates the stored cookie or the jwt bearer token
   * @param cookieOrDecodedContent Either the stored cookie or the decoded jwt bearer token
   */
  validate$(cookieOrDecodedContent: object | undefined): Promise<ValidateResponse>;

  /**
   * Creates a bearer token
   * @param user The authenticated user
   */
  createToken(user: IAuthenticatedUser): string;

  /**
   * Validates the user credentials
   * @param credentials The credentials
   */
  authenticate$<T extends IAuthCredentials>(credentials: T): Promise<AuthenticationResult>;
}
