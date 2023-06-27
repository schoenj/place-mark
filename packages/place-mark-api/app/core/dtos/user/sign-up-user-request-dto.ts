// eslint-disable-next-line import/no-extraneous-dependencies
import { ICreateUserReadWriteDto } from "@schoenj/place-mark-core";

export interface ISignUpUserRequestDto extends ICreateUserReadWriteDto {
  passwordAgain: string;
}
