import { ICreateUserReadWriteDto } from "./create-user-read-write-dto.js";

export interface ISignUpUserRequestDto extends ICreateUserReadWriteDto {
  passwordAgain: string;
}
