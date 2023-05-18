import { ICreateUserReadWriteDto } from "./ICreateUserReadWriteDto.js";

export interface ISignUpUserRequestDto extends ICreateUserReadWriteDto {
  passwordAgain: string;
}
