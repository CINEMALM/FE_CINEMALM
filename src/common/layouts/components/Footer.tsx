import {
  FacebookOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Link } from "react-router";

const footerGroups = [
  {
    title: "CinemaLM",
    links: [
      { label: "Về chúng tôi", href: "/about" },
      { label: "Hệ thống rạp", href: "/cinemas" },
      { label: "Tuyển dụng", href: "/careers" },
      { label: "Liên hệ", href: "/contact" },
    ],
  },
  {
    title: "Phim",
    links: [
      { label: "Đang chiếu", href: "/movie?status=now" },
      { label: "Sắp chiếu", href: "/movie?status=soon" },
      { label: "Lịch chiếu", href: "/showtime" },
      { label: "Giá vé", href: "/ticket-price" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Câu hỏi thường gặp", href: "/faqs" },
      { label: "Chính sách thành viên", href: "/membership" },
      { label: "Điều khoản sử dụng", href: "/terms" },
      { label: "Bảo mật thông tin", href: "/privacy" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0A]">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="block font-display text-2xl font-bold text-[#F2F2F2]">
                Cinema<span className="font-black text-[#DC0000]">LM</span>
              </span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#9A9A9A]">
              Không gian đặt vé điện ảnh cho trải nghiệm nhanh, rõ ràng và cao
              cấp: chọn phim, chọn suất, giữ ghế realtime và nhận vé QR trong
              tài khoản.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-black uppercase tracking-[0.22em] text-[#F2F2F2]">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="footer-link text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.22em] text-[#F2F2F2]">
              Liên hệ
            </h3>
            <div className="mt-5 space-y-4 text-sm text-[#9A9A9A]">
              <a
                href="tel:0123456789"
                className="flex items-center gap-3 hover:text-[#F2F2F2]"
              >
                <PhoneOutlined />
                012 3456 789
              </a>
              <a
                href="mailto:support@cinemalm.vn"
                className="flex items-center gap-3 hover:text-[#F2F2F2]"
              >
                <MailOutlined />
                support@cinemalm.vn
              </a>
              <p className="leading-6">Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</p>
            </div>
            <div className="mt-6 flex gap-3">
              {[FacebookOutlined, InstagramOutlined, YoutubeOutlined].map(
                (Icon, index) => (
                  <a
                    key={index}
                    href="/"
                    className="grid h-10 w-10 place-items-center border border-white/10 bg-[#141414] text-[#F2F2F2] transition hover:border-white/30"
                    aria-label="Social channel"
                  >
                    <Icon />
                  </a>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#9A9A9A] sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 CinemaLM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
