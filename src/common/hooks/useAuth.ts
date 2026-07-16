import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../stores/useAuthStore";
import type {
  IForgotPasswordPayload,
  ILoginPayload,
  IRegisterPayload,
  IResendVerificationPayload,
  IResetPasswordPayload,
  IVerifyEmailPayload,
} from "../types/auth";
import { QUERYKEY } from "../constants/queryKey";

export const useAuthMe = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useQuery({
    queryKey: [QUERYKEY.AUTH, QUERYKEY.AUTH.ME],
    queryFn: async () => {
      const user = await authService.me();
      setUser(user);
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    throwOnError: false,
    meta: {
      onError: () => clearAuth(),
    },
  });
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (payload: ILoginPayload) => {
      await authService.login(payload);
      return authService.me();
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData([QUERYKEY.AUTH, QUERYKEY.AUTH.ME], user);
    },
  });
};

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (payload: IRegisterPayload) => authService.register(payload),
  });

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: [QUERYKEY.AUTH] });
    },
  });
};

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: IForgotPasswordPayload) =>
      authService.forgotPassword(payload),
  });

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: IResetPasswordPayload) =>
      authService.resetPassword(payload),
  });

export const useVerifyEmailMutation = () =>
  useMutation({
    mutationFn: (payload: IVerifyEmailPayload) =>
      authService.verifyEmail(payload),
  });

export const useResendVerificationMutation = () =>
  useMutation({
    mutationFn: (payload: IResendVerificationPayload) =>
      authService.resendVerification(payload),
  });
