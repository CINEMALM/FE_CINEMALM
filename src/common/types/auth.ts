import type { IUser } from "./user";

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  email: string;
  phone: string;
  userName: string;
  password: string;
  confirmPassword: string;
}

export interface IBackendRegisterPayload {
  email: string;
  phone: string;
  user_name: string;
  password: string;
  password_confirmation: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}

export interface IVerifyEmailPayload {
  email: string;
  code: string;
}

export interface IResendVerificationPayload {
  email: string;
}

export interface ILogoutAllPayload {
  current_password: string;
}

export interface ICsrfResponse {
  csrf_token: string;
  csrf_header: string;
}

export interface IAuthUserResponse {
  user?: IUser;
}
