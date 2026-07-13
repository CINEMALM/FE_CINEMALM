import { Pagination, Table, Tag, type TableProps } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import {
  TICKET_STATUS,
  TICKET_STATUS_COLOR,
} from "../../../common/constants/ticket";
import type { ITicket } from "../../../common/types/ticket";
import { formatCurrency } from "../../../common/utils";

const mockTickets: ITicket[] = [
  {
    _id: "ticket-1",
    userId: "user-1",
    ticketId: "T001",
    showtimeId: "show-1",
    status: "PENDING",
    customerInfo: {
      userName: "Nguyễn Văn A",
      phone: "0909123456",
    },
    movieId: "movie-1",
    movieName: "Dune: Part Two",
    roomId: "room-1",
    roomName: "Phòng 1",
    items: [
      {
        seatId: "seat-1",
        seatLabel: "A1",
        price: 90000,
        type: "VIP",
      },
    ],
    startTime: "2026-07-08T19:30:00.000Z",
    qrCode: "qr-1",
    totalPrice: 90000,
    isPaid: true,
    createdAt: "2026-07-07T10:00:00.000Z",
    updatedAt: "2026-07-07T10:00:00.000Z",
  },
  {
    _id: "ticket-2",
    userId: "user-1",
    ticketId: "T002",
    showtimeId: "show-2",
    status: "CONFIRMED",
    customerInfo: {
      userName: "Nguyễn Văn A",
      phone: "0909123456",
    },
    movieId: "movie-2",
    movieName: "Inside Out 2",
    roomId: "room-2",
    roomName: "Phòng 2",
    items: [
      {
        seatId: "seat-2",
        seatLabel: "B3",
        price: 80000,
        type: "Thường",
      },
      {
        seatId: "seat-3",
        seatLabel: "B4",
        price: 80000,
        type: "Thường",
      },
    ],
    startTime: "2026-07-09T20:00:00.000Z",
    qrCode: "qr-2",
    totalPrice: 160000,
    isPaid: true,
    createdAt: "2026-07-06T15:30:00.000Z",
    updatedAt: "2026-07-06T15:30:00.000Z",
  },
];

const MyTicket = () => {
  const columns = [
    {
      title: <p style={{ whiteSpace: "nowrap", margin: 0 }}>Ngày giao dịch</p>,
      dataIndex: "createdAt",
      key: "createdAt",
      width: 350,
      render: (createdAt: string) => (
        <p className="line-clamp-1">
          {dayjs(createdAt).format("HH:mm, [Ngày] DD [Tháng] MM [Năm] YYYY")}
        </p>
      ),
    },
    {
      title: <p style={{ whiteSpace: "nowrap", margin: 0 }}>Tên phim</p>,
      dataIndex: "movieName",
      key: "movieName",
      render: (movieName: string) => (
        <p className="font-semibold line-clamp-1">{movieName}</p>
      ),
    },
    {
      title: <p style={{ whiteSpace: "nowrap", margin: 0 }}>Số vé</p>,
      dataIndex: "items",
      key: "items",
      render: (items: ITicket["items"]) => (
        <p className="font-semibold line-clamp-1">{items.length}</p>
      ),
    },
    {
      title: <p style={{ whiteSpace: "nowrap", margin: 0 }}>Trạng thái vé</p>,
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Đã mua", value: "PENDING" },
        { text: "Đã sử dụng", value: "CONFIRMED" },
        { text: "Đã bị huỷ", value: "CANCELLED" },
      ],
      render: (status: string) => (
        <Tag color={TICKET_STATUS_COLOR[status]} className="font-semibold!">
          {TICKET_STATUS[status]}
        </Tag>
      ),
    },
    {
      title: <p style={{ whiteSpace: "nowrap", margin: 0 }}>Số tiền</p>,
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice: number) => (
        <p className="font-semibold line-clamp-1">
          {formatCurrency(totalPrice)}
        </p>
      ),
    },
  ];

  const navigate = useNavigate();

  const onChange: TableProps<ITicket>["onChange"] = () => {};

  return (
    <div className="mt-12 max-w-7xl xl:mx-auto mx-6">
      <Table<ITicket>
        columns={columns}
        bordered
        dataSource={mockTickets}
        onChange={onChange}
        pagination={false}
        onRow={(record) => ({
          onClick: () => navigate(`/ticket/${record._id}`),
          style: { cursor: "pointer" },
        })}
      />

      <div className="mt-4">
        <Pagination
          align="end"
          current={1}
          pageSize={5}
          total={mockTickets.length}
          onChange={() => {}}
        />
      </div>
    </div>
  );
};

export default MyTicket;
