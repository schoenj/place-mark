import { Algorithm } from "jsonwebtoken";

/**
 * Declares properties for sharing the config for the jwt authentication
 */
export interface IJwtConfig {
  algorithm: Algorithm;
  expiresIn: number;
  password: string;
}
