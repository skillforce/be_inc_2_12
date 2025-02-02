export interface AuthLoginDto {
  loginOrEmail: string;
  password: string;
}

export interface LoginFilterSchema {
  email: string;
  login: string;
  password: string;
}
