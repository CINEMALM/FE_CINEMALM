import {
  DesktopOutlined,
  TagsOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { adminService } from "../../common/services/admin.service";

const AdminDashboard = () => {
  const movies = useQuery({
    queryKey: ["ADMIN", "DASHBOARD", "MOVIES"],
    queryFn: () => adminService.movies({ per_page: 1 }),
  });
  const categories = useQuery({
    queryKey: ["ADMIN", "DASHBOARD", "CATEGORIES"],
    queryFn: () => adminService.categories({ per_page: 1 }),
  });
  const rooms = useQuery({
    queryKey: ["ADMIN", "DASHBOARD", "ROOMS"],
    queryFn: () => adminService.rooms({ per_page: 1 }),
  });

  const cards = [
    {
      label: "Phim",
      value: movies.data?.total,
      to: "/admin/movies",
      icon: VideoCameraOutlined,
    },
    {
      label: "Thể loại",
      value: categories.data?.total,
      to: "/admin/categories",
      icon: TagsOutlined,
    },
    {
      label: "Phòng chiếu",
      value: rooms.data?.total,
      to: "/admin/rooms",
      icon: DesktopOutlined,
    },
  ];

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
        Dashboard
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
        Tổng quan hệ thống
      </h1>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="border border-white/10 bg-[#141414] p-5 transition hover:border-white/30"
          >
            <card.icon className="text-2xl text-[#DC0000]" />
            <p className="mt-6 font-display text-4xl font-bold">
              {card.value ?? "—"}
            </p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#9A9A9A]">
              {card.label}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-6 border border-white/10 bg-[#101010] p-5">
        <h2 className="font-display text-2xl font-bold">Phạm vi quản trị</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9A9A9A]">
          Admin hiện kết nối trực tiếp với các API phim, thể loại, phòng chiếu
          và sơ đồ ghế của CinemaLM. Các module lịch chiếu, vé và người dùng sẽ
          được bổ sung khi backend expose API tương ứng.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
