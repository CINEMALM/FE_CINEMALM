import api, { clearCsrfToken } from "../utils/api";
import type {
  IForgotPasswordPayload,
  ILoginPayload,
  ILogoutAllPayload,
  IRegisterPayload,
  IResendVerificationPayload,
  IResetPasswordPayload,
  IVerifyEmailPayload,
} from "../types/auth";
import type { TypeResponse } from "../types/response";
import type { IUser } from "../types/user";

type AuthResponseData = {
  user?: Partial<IUser> & Record<string, unknown>;
} & Record<string, unknown>;

const normalizeUser = (raw?: unknown): IUser | null => {
  const data = raw as AuthResponseData | undefined;
  const source = (data && "user" in data && data.user ? data.user : data) as
    | (Partial<IUser> & Record<string, unknown>)
    | undefined;

  if (!source) {
    return null;
  }

  return {
    _id: String(source._id || source.id || ""),
    userName: String(source.userName || source.user_name || source.name || ""),
    avatar: String(source.avatar || ""),
    email: String(source.email || ""),
    phone: String(source.phone || ""),
    isVerified: Boolean(source.isVerified ?? source.is_verified ?? false),
    role: String(source.role || "customer").toLowerCase(),
    banned: (source.banned as IUser["banned"]) || {
      isBanned: false,
      description: "",
      bannedAt: "",
    },
    createdAt: source.createdAt ? String(source.createdAt) : undefined,
    updatedAt: source.updatedAt ? String(source.updatedAt) : undefined,
  };
};

export const authService = {
  googleLogin() {
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
    window.location.assign(`${baseUrl}/auth/google/redirect`);
  },
  async register(payload: IRegisterPayload) {
    const body = {
      user_name: payload.userName,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      password_confirmation: payload.confirmPassword,
    };

    const response = await api.post<TypeResponse<AuthResponseData>>(
      "/auth/register",
      body,
    );
    return response.data;
  },

  async login(payload: ILoginPayload) {
    const response = await api.post<TypeResponse<AuthResponseData>>(
      "/auth/login",
      payload,
    );
    return response.data;
  },

  async me() {
    const response =
      await api.get<TypeResponse<AuthResponseData | IUser>>("/auth/me");
    return normalizeUser(response.data.data);
  },

  async refresh() {
    const response =
      await api.post<TypeResponse<AuthResponseData>>("/auth/refresh");
    return response.data;
  },

  async logout() {
    const response = await api.post<TypeResponse<null>>("/auth/logout");
    clearCsrfToken();
    return response.data;
  },

  async logoutAll(payload: ILogoutAllPayload) {
    const response = await api.post<TypeResponse<null>>(
      "/auth/logout-all",
      payload,
    );
    clearCsrfToken();
    return response.data;
  },

  async resendVerification(payload: IResendVerificationPayload) {
    const response = await api.post<TypeResponse<null>>(
      "/auth/resend-verification",
      payload,
    );
    return response.data;
  },

  async verifyEmail(payload: IVerifyEmailPayload) {
    const response = await api.post<TypeResponse<null>>(
      "/auth/verify-email",
      payload,
    );
    return response.data;
  },

  async forgotPassword(payload: IForgotPasswordPayload) {
    const response = await api.post<TypeResponse<null>>(
      "/auth/forgot-password",
      payload,
    );
    return response.data;
  },

  async resetPassword(payload: IResetPasswordPayload) {
    const response = await api.post<TypeResponse<null>>(
      "/auth/reset-password",
      payload,
    );
    return response.data;
  },

  async updateProfile(payload: {
    userName: string;
    phone?: string;
    avatar?: string;
  }) {
    const response = await api.patch<TypeResponse<AuthResponseData>>(
      "/auth/profile",
      {
        user_name: payload.userName,
        phone: payload.phone || null,
        avatar: payload.avatar || null,
      },
    );
    return normalizeUser(response.data.data);
  },

  async changePassword(payload: {
    currentPassword?: string;
    password: string;
    passwordConfirmation: string;
  }) {
    const response = await api.patch<TypeResponse<AuthResponseData>>(
      "/auth/password",
      {
        current_password: payload.currentPassword,
        password: payload.password,
        password_confirmation: payload.passwordConfirmation,
      },
    );
    return normalizeUser(response.data.data);
  },
};
