import { Outlet } from "react-router";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ConfigProvider, theme, App } from "antd";
const MainLayout = () => {
  return (
    <div className="bg-[#10141b] min-h-screen text-white">
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorBgContainer: "#10141b",
            colorPrimary: "#ef4444",
          },
          components: {
            Modal: {
              contentBg: "transparent",
              headerBg: "transparent",
              footerBg: "transparent",
            },
          },
        }}
      >
        <App>
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
