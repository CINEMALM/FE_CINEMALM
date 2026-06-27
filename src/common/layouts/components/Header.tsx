import { BellOutlined, HeartFilled } from "@ant-design/icons";
import { Badge } from "antd";

const Header = () => {
  return (
    <header className="bg-black">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-end gap-2 cursor-pointer">
          <img
            src="https://www.freeiconspng.com/thumbs/bee-png/best-free-bee-png-image-5.png"
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

          <button className="border border-white px-6 py-2 rounded-full text-white">
            Đăng ký
          </button>

          <button className="bg-red-500 px-6 py-2 rounded-full text-white">
            Đăng nhập
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;