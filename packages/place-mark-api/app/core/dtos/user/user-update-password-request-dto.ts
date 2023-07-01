export interface IUserUpdatePasswordRequestDto {
  oldPassword: string;
  password: string;
  passwordAgain: string;
}
