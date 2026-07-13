import { NavLink, Outlet } from "react-router";
import { useAuthSelector } from "../stores/useAuthStore";

const ProfileLayout = () => {
  const logout = useAuthSelector((state) => state.logout);
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl xl:mx-auto mx-6 mt-8">
        <h2 className="text-xl font-semibold text-center">Thông tin cá nhân</h2>
        <div className="flex items-center gap-6 justify-between mt-8">
          <NavLink
            end={true}
            to="/profile"
            className={({ isActive }) =>
              `${isActive ? "bg-primary! text-white! w-full! " : "border"}
            w-full! text-center! px-3 py-2 rounded-full text-white!
            `
            }
          >
            Thông tin cá nhân
          </NavLink>
          <NavLink
            end={true}
            to="/profile/ticket"
            className={({ isActive }) =>
              `${isActive ? "bg-primary! text-white! w-full! " : "border"}
            w-full! text-center! px-3 py-2 rounded-full text-white!
            `
            }
          >
            Lịch sử mua vé
          </NavLink>
          <NavLink
            onClick={() => logout()}
            to={"/"}
            className={`
            w-full! text-center! px-3 py-2 rounded-full text-primary! border border-primary!
            `}
          >
            Đăng xuất
          </NavLink>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
