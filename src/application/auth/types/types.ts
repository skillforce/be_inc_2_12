export interface LoginBodyRequiredData {
  loginOrEmail: string;
  password: string;
}

export interface LoginFilterSchema {
  email: string;
  login: string;
  password: string;
}
