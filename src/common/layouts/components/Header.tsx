import { BellOutlined, HeartFilled } from "@ant-design/icons";
import { Badge } from "antd";
import LoginModal from "../../../components/LoginModal";
import RegisterModal from "../../../components/RegisterModal";

const Header = () => {
  return (
    <header className="bg-black">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-end gap-2 cursor-pointer">
          <img
            src="https://www.freeiconspng.com/uploads/movie-theatre-png-10.png"
            alt="Logo"
            className="w-16"
          />
          <p className="text-white font-semibold leading-5">
            LM <br />
            CINEMA
          </p>
        </div>

        {/* Menu */}
        <ul className="flex items-center gap-6 text-white">
          <li className="text-red-500">Trang chủ</li>
          <li>Lịch chiếu</li>
          <li>Tin tức</li>
          <li>Khuyến mãi</li>
          <li>Giá vé</li>
          <li>Giới thiệu</li>
        </ul>

        {/* Right */}
        <div className="flex items-center gap-6">
          <HeartFilled className="text-xl text-white cursor-pointer" />

          <Badge count={0} showZero>
            <BellOutlined className="text-xl text-white cursor-pointer" />
          </Badge>

          <RegisterModal>
            <button className="border border-white px-6 py-2 rounded-full text-white hover:bg-white/10 transition cursor-pointer">
              Đăng ký
            </button>
          </RegisterModal>

          <LoginModal>
            <button className="bg-red-500 px-6 py-2 rounded-full text-white hover:opacity-90 transition cursor-pointer">
              Đăng nhập
            </button>
          </LoginModal>
        </div>
      </div>
    </header>
  );
};

export default Header;