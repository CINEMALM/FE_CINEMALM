import {
  CloseOutlined,
  DashboardOutlined,
  MenuOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Input, Modal } from "antd";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const user = useAuthSelector((state) => state.user);
  const isAuthenticated = useAuthSelector((state) => state.isAuthenticated);
  const logoutMutation = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const accountName = user?.userName?.trim() || "Tài khoản";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (isAuthenticated) {
      setOpen(false);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setOpen(false);
    // logoutMutation.mutate();

    logoutMutation.mutate(undefined, {
      onSettled: () => navigate("/", { replace: true }),
    });
  };

  const submitSearch = (value = searchKeyword) => {
    const keyword = value.trim();
    setSearchOpen(false);
    setOpen(false);
    navigate(
      keyword ? `/movie?keyword=${encodeURIComponent(keyword)}` : "/movie",
    );
  };

  const outlineActionClass =
    "border border-white/15 text-[#F2F2F2] transition hover:border-[#DC0000] hover:bg-[#DC0000] hover:text-[#0A0A0A]";
  const primaryActionClass =
    "bg-[#DC0000] text-[#0A0A0A] transition hover:bg-[#F2F2F2]";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-6 xl:h-[88px] xl:px-10">
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
          className="hidden items-center gap-6 xl:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`border-b-2 py-2 text-sm font-semibold uppercase tracking-[0.16em] transition ${
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href))
                  ? "border-[#DC0000] text-[#F2F2F2]"
                  : "border-transparent text-[#9A9A9A] hover:border-[#DC0000] hover:text-[#F2F2F2]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <button
            type="button"
            className={`grid h-11 w-11 place-items-center bg-[#141414] ${outlineActionClass}`}
            aria-label="Tìm kiếm"
            onClick={() => setSearchOpen(true)}
          >
            <SearchOutlined />
          </button>

          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`inline-flex h-11 items-center gap-2 px-4 text-xs font-black uppercase tracking-[0.1em] ${outlineActionClass}`}
                >
                  <DashboardOutlined />
                  Trang quản trị
                </Link>
              )}
              <Link
                to="/profile"
                className={`h-11 max-w-44 truncate px-4 text-sm font-bold uppercase leading-[42px] tracking-[0.1em] ${outlineActionClass}`}
              >
                {accountName}
              </Link>
              <button
                type="button"
                className={`h-11 px-4 text-sm font-black uppercase tracking-[0.12em] ${primaryActionClass}`}
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
                  className={`h-11 px-5 text-sm font-bold uppercase tracking-[0.14em] ${outlineActionClass}`}
                >
                  Đăng ký
                </button>
              </RegisterModal>
              <LoginModal>
                <button
                  type="button"
                  className={`h-11 px-5 text-sm font-black uppercase tracking-[0.14em] ${primaryActionClass}`}
                >
                  Đăng nhập
                </button>
              </LoginModal>
            </>
          )}
        </div>

        <button
          type="button"
          className={`grid h-11 w-11 place-items-center bg-[#141414] xl:hidden ${outlineActionClass}`}
          aria-label="Mở menu"
          onClick={() => setOpen(true)}
        >
          <MenuOutlined />
        </button>
      </div>

      {open && (
        <div
          className="cinemalm-mobile-menu xl:hidden"
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

          <div className="mt-8">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={`flex h-12 w-full items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.14em] ${outlineActionClass}`}
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
                  className={`flex h-12 min-w-0 items-center justify-center truncate px-3 text-sm font-bold uppercase tracking-[0.14em] ${outlineActionClass}`}
                  title={accountName}
                >
                  {accountName}
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

      <Modal
        title="Tìm kiếm phim"
        open={searchOpen}
        footer={null}
        width={560}
        onCancel={() => setSearchOpen(false)}
        afterOpenChange={(visible) => {
          if (!visible) setSearchKeyword("");
        }}
      >
        <Input.Search
          autoFocus
          allowClear
          size="large"
          value={searchKeyword}
          placeholder="Nhập tên phim hoặc đạo diễn..."
          enterButton="Tìm kiếm"
          onChange={(event) => setSearchKeyword(event.target.value)}
          onSearch={submitSearch}
        />
      </Modal>
    </header>
  );
};

export default Header;
