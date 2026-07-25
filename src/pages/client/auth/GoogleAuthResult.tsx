import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { authService } from "../../../common/services/auth.service";
import { useAuthStore } from "../../../common/stores/useAuthStore";

const GoogleAuthResult = () => {
  const { result } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (result !== "success") return;
    authService
      .me()
      .then((user) => {
        const { pendingPath, setUser, clearPendingLogin } =
          useAuthStore.getState();
        setUser(user);
        clearPendingLogin();
        navigate(pendingPath || "/", { replace: true });
      })
      .catch(() => navigate("/auth/google/error", { replace: true }));
  }, [navigate, result]);

  const isSuccess = result === "success";
  return (
    <div className="flex min-h-[65vh] items-center justify-center bg-[#0A0A0A] px-4 text-center">
      <div className="border border-white/10 bg-[#141414] p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#DC0000]">
          Google authentication
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold">
          {isSuccess
            ? "Đang hoàn tất đăng nhập..."
            : "Đăng nhập Google thất bại"}
        </h1>
        {!isSuccess && (
          <p className="mt-3 text-sm text-[#9A9A9A]">
            {params.get("reason") || "Không thể xác thực tài khoản Google."}
          </p>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthResult;
