export interface AuthLoginDto {
  loginOrEmail: string;
  password: string;
}
export interface RegisterUserDto {
  login: string;
  password: string;
  email: string;
}

export interface LoginFilterSchema {
  email: string;
  login: string;
  password: string;
}
