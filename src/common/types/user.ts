import type { IRegisterPayload } from "./auth";

export interface IBannerUser {
  isBanned: boolean;
  description: string;
  bannedAt: string;
}

export interface IUser {
  _id: string;
  userName: string;
  avatar: string;
  email: string;
  phone: string;
  isVerified: boolean;
  role: string;
  banned: IBannerUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPayloadUpdateUser {
  avatar: string;
  email: string;
  phone: string;
  userName: string;
}

export type CreateUserPayload = Omit<
  IRegisterPayload,
  "confirmPassword" | "password"
> & {
  role: string;
};
