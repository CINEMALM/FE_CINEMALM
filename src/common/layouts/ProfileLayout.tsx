import { useEffect } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router";
import { useLogoutMutation } from "../hooks/useAuth";
import { useAuthSelector } from "../stores/useAuthStore";

const ProfileLayout = () => {
  const logoutMutation = useLogoutMutation();
  const location = useLocation();
  const isAuthenticated = useAuthSelector((state) => state.isAuthenticated);
  const requestLogin = useAuthSelector((state) => state.requestLogin);

  useEffect(() => {
    if (!isAuthenticated) {
      requestLogin({ path: `${location.pathname}${location.search}` });
    }
  }, [isAuthenticated, location.pathname, location.search, requestLogin]);

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen">
      <div className="mx-4 mt-8 max-w-4xl xl:mx-auto">
        <h2 className="text-center text-xl font-semibold">Thông tin cá nhân</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <NavLink
            end
            to="/profile"
            className={({ isActive }) =>
              `${
                isActive ? "bg-primary! text-white!" : "border border-white/20"
              } w-full! text-center! px-3 py-2 text-white!`
            }
          >
            Thông tin cá nhân
          </NavLink>
          <NavLink
            end
            to="/profile/ticket"
            className={({ isActive }) =>
              `${
                isActive ? "bg-primary! text-white!" : "border border-white/20"
              } w-full! text-center! px-3 py-2 text-white!`
            }
          >
            Lịch sử mua vé
          </NavLink>
          <NavLink
            onClick={() => logoutMutation.mutate()}
            to="/"
            className="w-full! border border-primary! px-3 py-2 text-center! text-primary!"
          >
            Đăng xuất
          </NavLink>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default ProfileLayout;
