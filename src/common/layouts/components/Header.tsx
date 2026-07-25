import {
  CloseOutlined,
  DashboardOutlined,
  MenuOutlined,
  ProfileOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useLogoutMutation } from "../../hooks/useAuth";
import { useAuthSelector } from "../../stores/useAuthStore";
import LoginModal from "../../../components/LoginModal";
import RegisterModal from "../../../components/RegisterModal";

const navItems = [
  { label: "Trang chủ", href: "/" },
  { label: "Phim & lịch chiếu", href: "/movie" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const user = useAuthSelector((state) => state.user);
  const isAuthenticated = useAuthSelector((state) => state.isAuthenticated);
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const requestLogin = useAuthSelector((state) => state.requestLogin);

  const requireLogin = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    if (isAuthenticated) return;
    event.preventDefault();
    setOpen(false);
    requestLogin({ path });
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    // logoutMutation.mutate();

    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/"),
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:h-[88px] lg:px-10 gap-4">
        <Link
          to="/"
          className="group flex items-center gap-3"
          aria-label="CinemaLM"
        >
          <span className="leading-none">
            <span className="block font-display text-2xl font-bold text-[#F2F2F2]">
              Cinema<span className="font-black text-[#DC0000]">LM</span>
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-sm font-semibold uppercase tracking-[0.16em] transition ${
                index === 0
                  ? "text-[#F2F2F2]"
                  : "text-[#9A9A9A] hover:text-[#F2F2F2]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            className="grid h-11 w-11 place-items-center border border-white/10 bg-[#141414] text-[#F2F2F2] transition hover:border-white/30"
            aria-label="Tìm kiếm"
          >
            <SearchOutlined />
          </button>
          <Link
            to="/profile/ticket"
            onClick={(event) => requireLogin(event, "/profile/ticket")}
            className="grid h-11 w-11 place-items-center border border-white/10 bg-[#141414] text-[#F2F2F2] transition hover:border-white/30"
            aria-label="Vé của tôi"
          >
            <ProfileOutlined />
          </Link>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex h-11 items-center gap-2 border border-[#DC0000]/60 px-4 text-xs font-black uppercase tracking-[0.1em] text-[#DC0000] transition hover:bg-[#DC0000] hover:text-[#0A0A0A]"
                >
                  <DashboardOutlined />
                  Trang quản trị
                </Link>
              )}
              <Link
                to="/profile"
                className="h-11 max-w-48 truncate border border-white/15 px-5 text-sm font-bold uppercase leading-[44px] tracking-[0.14em] text-[#F2F2F2] transition hover:border-white/40"
              >
                {user?.userName || "Tài khoản"}
              </Link>
              <button
                type="button"
                className="h-11 bg-[#DC0000] px-5 text-sm font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition hover:bg-[#F2F2F2]"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <RegisterModal>
                <button
                  type="button"
                  className="h-11 border border-white/15 px-5 text-sm font-bold uppercase tracking-[0.14em] text-[#F2F2F2] transition hover:border-white/40"
                >
                  Đăng ký
                </button>
              </RegisterModal>
              <LoginModal>
                <button
                  type="button"
                  className="h-11 bg-[#DC0000] px-5 text-sm font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition hover:bg-[#F2F2F2]"
                >
                  Đăng nhập
                </button>
              </LoginModal>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center border border-white/10 bg-[#141414] text-[#F2F2F2] lg:hidden"
          aria-label="Mở menu"
          onClick={() => setOpen(true)}
        >
          <MenuOutlined />
        </button>
      </div>

      {open && (
        <div
          className="cinemalm-mobile-menu lg:hidden"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            minHeight: "100dvh",
            overflowY: "auto",
            backgroundColor: "#0A0A0A",
            padding: "20px",
          }}
        >
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-3"
              onClick={() => setOpen(false)}
            >
              <span className="block font-display text-2xl font-bold text-[#F2F2F2]">
                Cinema<span className="font-black text-[#DC0000]">LM</span>
              </span>
            </Link>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center border border-white/10 bg-[#141414] text-[#F2F2F2]"
              aria-label="Đóng menu"
              onClick={() => setOpen(false)}
            >
              <CloseOutlined />
            </button>
          </div>

          <nav
            className="mt-10 flex flex-col gap-2"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-5 font-display text-3xl font-bold text-[#F2F2F2]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Link
              to="/profile/ticket"
              onClick={(event) => {
                setOpen(false);
                requireLogin(event, "/profile/ticket");
              }}
              className="flex h-12 items-center justify-center gap-2 border border-white/15 text-sm font-bold uppercase tracking-[0.14em] text-[#F2F2F2]"
            >
              <ProfileOutlined />
              Vé của tôi
            </Link>
            <button
              type="button"
              className="flex h-12 items-center justify-center gap-2 border border-white/15 text-sm font-bold uppercase tracking-[0.14em] text-[#F2F2F2]"
            >
              <SearchOutlined />
              Tìm kiếm
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="col-span-2 flex h-12 items-center justify-center gap-2 border border-[#DC0000]/60 text-sm font-black uppercase tracking-[0.12em] text-[#DC0000]"
                  >
                    <DashboardOutlined />
                    Trang quản trị
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex h-12 items-center justify-center border border-white/15 text-sm font-bold uppercase tracking-[0.14em] text-[#F2F2F2]"
                >
                  Tài khoản
                </Link>
                <button
                  type="button"
                  className="h-12 bg-[#DC0000] text-sm font-black uppercase tracking-[0.14em] text-[#0A0A0A]"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <RegisterModal>
                  <button
                    type="button"
                    className="h-12 border border-white/15 text-sm font-bold uppercase tracking-[0.14em] text-[#F2F2F2]"
                  >
                    Đăng ký
                  </button>
                </RegisterModal>
                <LoginModal>
                  <button
                    type="button"
                    className="h-12 bg-[#DC0000] text-sm font-black uppercase tracking-[0.14em] text-[#0A0A0A]"
                  >
                    Đăng nhập
                  </button>
                </LoginModal>
              </>
            )}
          </div>

          <p className="mt-10 text-sm leading-6 text-[#9A9A9A]">
            Đặt vé nhanh, chọn ghế realtime, thanh toán online và lưu vé QR
            trong tài khoản của bạn.
          </p>
        </div>
      )}
    </header>
  );
};

export default Header;
