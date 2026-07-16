import { Outlet } from "react-router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ConfigProvider, theme, App } from "antd";
import { useAuthMe } from "../hooks/useAuth";
import { useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";

const AuthInitializer = () => {
  const authMeQuery = useAuthMe();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (authMeQuery.isError) {
      clearAuth();
    }
  }, [authMeQuery.isError, clearAuth]);

  return null;
};

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2]">
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorBgBase: "#0A0A0A",
            colorBgContainer: "#141414",
            colorBorder: "rgba(255,255,255,0.12)",
            colorPrimary: "#DC0000",
            colorText: "#F2F2F2",
            colorTextSecondary: "#9A9A9A",
            borderRadius: 2,
            fontFamily: "Inter, sans-serif",
          },
          components: {
            Modal: {
              contentBg: "#141414",
              headerBg: "#141414",
              footerBg: "#141414",
              borderRadiusLG: 4,
            },
            Button: {
              borderRadius: 2,
              colorPrimary: "#DC0000",
              colorPrimaryHover: "#F2F2F2",
              colorPrimaryActive: "#F2F2F2",
            },
          },
        }}
      >
        <App>
          <AuthInitializer />
          <Header />
          <main>
            <Outlet />
          </main>
          <Footer />
        </App>
      </ConfigProvider>
    </div>
  );
};

export default MainLayout;
