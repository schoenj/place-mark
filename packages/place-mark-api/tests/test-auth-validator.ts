import jwt from "jsonwebtoken";
import { IJwtConfig } from "../app/config/interfaces/index.js";

export class TestAuthValidator {
  private _user: { id: string; admin: boolean; email: string }[] = [];

  private readonly _config: IJwtConfig;

  constructor(config: IJwtConfig) {
    this._config = config;
  }

  public validate(cookieOrDecodedContent: object | undefined):
    | {
        id: string;
        admin: boolean;
        email: string;
      }
    | null
    | undefined {
    if (cookieOrDecodedContent && typeof cookieOrDecodedContent === "object" && "id" in cookieOrDecodedContent && typeof cookieOrDecodedContent.id === "string") {
      return this._user.find((x) => x.id === cookieOrDecodedContent.id) || undefined;
    }

    return null;
  }

  public removeById(id: string): void {
    this._user = this._user.filter((x) => x.id !== id);
  }

  public removeByMail(email: string): void {
    this._user = this._user.filter((x) => x.email !== email);
  }

  public add(user: { id: string; admin: boolean; email: string }): string {
    this._user.push(user);
    const token = jwt.sign(user, this._config.password, {
      algorithm: this._config.algorithm,
      expiresIn: this._config.expiresIn,
    });
    return token;
  }
}
