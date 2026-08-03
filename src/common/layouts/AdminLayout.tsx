import {
  AppstoreOutlined,
  CoffeeOutlined,
  CreditCardOutlined,
  DesktopOutlined,
  GiftOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QrcodeOutlined,
  ScheduleOutlined,
  ShoppingOutlined,
  TagsOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { ConfigProvider, theme } from "antd";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { authService } from "../services/auth.service";
import { useAuthSelector } from "../stores/useAuthStore";

const menuItems = [
  { to: "/admin", label: "Tổng quan", icon: AppstoreOutlined, end: true },
  { to: "/admin/movies", label: "Phim", icon: VideoCameraOutlined },
  { to: "/admin/showtimes", label: "Suất chiếu", icon: ScheduleOutlined },
  { to: "/admin/tickets", label: "Vé", icon: CreditCardOutlined },
  { to: "/admin/concession", label: "Quầy bắp nước", icon: CoffeeOutlined },
  { to: "/admin/products", label: "Bắp nước", icon: ShoppingOutlined },
  { to: "/admin/promotions", label: "Khuyến mại", icon: GiftOutlined },
  { to: "/admin/categories", label: "Thể loại", icon: TagsOutlined },
  { to: "/admin/rooms", label: "Phòng & ghế", icon: DesktopOutlined },
  { to: "/admin/check-in", label: "Check-in QR", icon: QrcodeOutlined },
  { to: "/admin/counter", label: "Counter", icon: QrcodeOutlined },
];

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const user = useAuthSelector((state) => state.user);
  const clearAuth = useAuthSelector((state) => state.clearAuth);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  const logout = async () => {
    await authService.logout().catch(() => undefined);
    clearAuth();
    navigate("/");
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#DC0000",
          colorBgBase: "#0A0A0A",
          colorBgContainer: "#141414",
          colorBgElevated: "#141414",
          colorBorder: "rgba(255,255,255,0.12)",
          colorBorderSecondary: "rgba(255,255,255,0.08)",
          colorText: "#F2F2F2",
          colorTextSecondary: "#9A9A9A",
          colorFillAlter: "rgba(255,255,255,0.04)",
          borderRadius: 2,
          fontFamily: "Inter, sans-serif",
        },
        components: {
          Table: {
            headerBg: "#101010",
            headerColor: "#F2F2F2",
            rowHoverBg: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.1)",
            colorBgContainer: "#141414",
          },
          Input: {
            activeBg: "#101010",
            hoverBg: "#101010",
            colorBgContainer: "#101010",
          },
          InputNumber: {
            activeBg: "#101010",
            hoverBg: "#101010",
            colorBgContainer: "#101010",
          },
          Select: {
            selectorBg: "#101010",
            optionSelectedBg: "rgba(220,0,0,0.25)",
          },
          DatePicker: {
            activeBg: "#101010",
            hoverBg: "#101010",
            colorBgContainer: "#101010",
          },
          Modal: {
            contentBg: "#141414",
            headerBg: "#141414",
            footerBg: "#141414",
          },
          Pagination: {
            itemBg: "#141414",
          },
        },
      }}
    >
      <div className="admin-theme min-h-screen bg-[#0A0A0A] text-[#F2F2F2]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-[#101010] p-4 transition-transform lg:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Link
            to="/admin"
            className="block border-b border-white/10 px-2 pb-5"
          >
            <span className="font-display text-2xl font-bold">CinemaLM</span>
            <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.22em] text-[#DC0000]">
              Admin Console
            </span>
          </Link>
          <nav className="mt-5 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 px-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-[#DC0000] text-[#0A0A0A]"
                      : "text-[#9A9A9A] hover:bg-white/5 hover:text-[#F2F2F2]"
                  }`
                }
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {open && (
          <button
            type="button"
            aria-label="Đóng menu"
            className="fixed inset-0 z-30 bg-black/70 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b border-white/10 bg-[#0A0A0A]/95 px-4 backdrop-blur sm:px-6">
            <button
              type="button"
              aria-label="Mở menu"
              onClick={() => setOpen((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center border border-white/10 lg:hidden"
            >
              {open ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </button>
            <div className="ml-auto flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex min-h-10 items-center gap-2 border border-white/10 px-3 text-xs font-bold"
              >
                <HomeOutlined />
                <span className="hidden sm:inline">Trang khách</span>
              </Link>
              <div className="hidden px-3 text-right sm:block">
                <p className="text-xs font-bold">{user?.userName}</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#DC0000]">
                  Administrator
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 w-10 items-center justify-center border border-white/10 transition hover:border-[#DC0000]"
                aria-label="Đăng xuất"
              >
                <LogoutOutlined />
              </button>
            </div>
          </header>
          <main className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default AdminLayout;
