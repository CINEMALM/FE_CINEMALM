import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import type { TypeResponse } from "../types/response";
import type { ICsrfResponse } from "../types/auth";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _csrfRetry?: boolean;
  _skipAuthRefresh?: boolean;
};

type QueueItem = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

const unsafeMethods = ["post", "put", "patch", "delete"];
const authNoRefreshPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/auth/refresh",
  "/auth/logout",
  "/auth/csrf-cookie",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/resend-verification",
];

let csrfToken: string | null = null;
let csrfHeader = "X-CINEMALM-CSRF";
let csrfRequest: Promise<string | null> | null = null;
let isRefreshing = false;
let refreshQueue: QueueItem[] = [];
const accessTokenStorageKey = "cinemalm_access_token";

export const getAccessToken = () =>
  typeof window === "undefined"
    ? null
    : window.localStorage.getItem(accessTokenStorageKey);

export const setAccessToken = (token?: string | null) => {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(accessTokenStorageKey, token);
    return;
  }

  window.localStorage.removeItem(accessTokenStorageKey);
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  timeout: 20_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const isUnsafeMethod = (method?: string) =>
  unsafeMethods.includes((method || "get").toLowerCase());

const isAuthNoRefreshPath = (url?: string) =>
  Boolean(url && authNoRefreshPaths.some((path) => url.includes(path)));

const resolveRefreshQueue = (error?: unknown) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }
    resolve();
  });
  refreshQueue = [];
};

export const clearCsrfToken = () => {
  csrfToken = null;
  csrfHeader = "X-CINEMALM-CSRF";
  csrfRequest = null;
};

export const initCsrfToken = async () => {
  if (csrfToken) {
    return csrfToken;
  }

  if (!csrfRequest) {
    csrfRequest = api
      .get<TypeResponse<ICsrfResponse>>("/auth/csrf-cookie", {
        _skipAuthRefresh: true,
      } as AxiosRequestConfig)
      .then((response) => {
        csrfToken = response.data.data.csrf_token;
        csrfHeader = response.data.data.csrf_header || csrfHeader;
        return csrfToken;
      })
      .finally(() => {
        csrfRequest = null;
      });
  }

  return csrfRequest;
};

api.interceptors.request.use(
  async (config) => {
    const accessToken = getAccessToken();

    if (
      accessToken &&
      !config.headers.has("Authorization") &&
      !config.url?.includes("/auth/refresh")
    ) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (
      isUnsafeMethod(config.method) &&
      !config.url?.includes("/auth/csrf-cookie")
    ) {
      await initCsrfToken();

      if (csrfToken) {
        config.headers.set(csrfHeader, csrfToken);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      originalRequest &&
      error.response?.status === 419 &&
      isUnsafeMethod(originalRequest.method) &&
      !originalRequest._csrfRetry &&
      !originalRequest.url?.includes("/auth/csrf-cookie")
    ) {
      originalRequest._csrfRetry = true;
      clearCsrfToken();
      await initCsrfToken();
      return api(originalRequest);
    }

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh ||
      isAuthNoRefreshPath(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      await new Promise<void>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });

      return api(originalRequest);
    }

    isRefreshing = true;

    try {
      const refreshResponse = await api.post("/auth/refresh", undefined, {
        _skipAuthRefresh: true,
      } as AxiosRequestConfig);
      const refreshData = refreshResponse.data as
        | { data?: { access_token?: string } }
        | undefined;
      setAccessToken(refreshData?.data?.access_token || null);
      resolveRefreshQueue();
      return api(originalRequest);
    } catch (refreshError) {
      resolveRefreshQueue(refreshError);
      clearCsrfToken();
      setAccessToken(null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
