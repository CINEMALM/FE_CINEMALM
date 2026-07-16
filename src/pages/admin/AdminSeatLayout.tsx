import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Empty, Modal, Select, Switch } from "antd";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { seatTypeColor } from "../../common/constants";
import { adminService } from "../../common/services/admin.service";
import type { ISeat } from "../../common/types/seat";

const AdminSeatLayout = () => {
  const { roomId = "" } = useParams();
  const [generateType, setGenerateType] = useState<ISeat["type"]>("NORMAL");
  const queryClient = useQueryClient();
  const queryKey = ["ADMIN", "SEAT_LAYOUT", roomId];
  const query = useQuery({
    queryKey,
    queryFn: () => adminService.seatLayout(roomId),
    enabled: Boolean(roomId),
  });
  const generate = useMutation({
    mutationFn: () => adminService.generateSeats(roomId, generateType),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const update = useMutation({
    mutationFn: ({ seat, payload }: { seat: ISeat; payload: Partial<ISeat> }) =>
      adminService.updateSeat(seat._id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const seats = query.data?.layout.flat() || [];

  return (
    <div>
      <Link
        to="/admin/rooms"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#9A9A9A]"
      >
        <ArrowLeftOutlined />
        Danh sách phòng
      </Link>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Seat Layout
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            {query.data?.room.name || "Sơ đồ ghế"}
          </h1>
        </div>
        {!query.isLoading && seats.length === 0 && (
          <div className="flex gap-2">
            <Select
              value={generateType}
              onChange={setGenerateType}
              options={[
                { value: "NORMAL", label: "Ghế thường" },
                { value: "VIP", label: "Ghế VIP" },
                { value: "COUPLE", label: "Ghế đôi" },
              ]}
              className="w-36"
            />
            <Button
              type="primary"
              loading={generate.isPending}
              onClick={() =>
                Modal.confirm({
                  title: "Sinh toàn bộ sơ đồ ghế?",
                  content: "Sơ đồ chỉ có thể sinh tự động một lần.",
                  onOk: () => generate.mutateAsync(),
                })
              }
            >
              Sinh sơ đồ
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 border border-white/10 bg-[#101010] p-4 sm:p-6">
        {query.isLoading ? (
          <div className="py-20 text-center text-[#9A9A9A]">Đang tải...</div>
        ) : seats.length === 0 ? (
          <Empty description="Phòng chưa có sơ đồ ghế" />
        ) : (
          <div className="overflow-x-auto pb-3">
            <div
              className="mx-auto grid min-w-max gap-2"
              style={{
                gridTemplateColumns: `repeat(${query.data?.room.cols}, 42px)`,
              }}
            >
              {seats.map((seat) => (
                <button
                  key={seat._id}
                  type="button"
                  title={`${seat.label} · ${seat.type}`}
                  onClick={() =>
                    Modal.confirm({
                      title: `Cập nhật ghế ${seat.label}`,
                      content: (
                        <div className="mt-4 space-y-4">
                          <Select
                            defaultValue={seat.type}
                            className="w-full"
                            options={[
                              { value: "NORMAL", label: "Ghế thường" },
                              { value: "VIP", label: "Ghế VIP" },
                              { value: "COUPLE", label: "Ghế đôi" },
                            ]}
                            onChange={(type) =>
                              update.mutate({ seat, payload: { type } })
                            }
                          />
                          <div className="flex items-center justify-between">
                            <span>Hoạt động</span>
                            <Switch
                              defaultChecked={seat.status}
                              onChange={(status) =>
                                update.mutate({ seat, payload: { status } })
                              }
                            />
                          </div>
                        </div>
                      ),
                      footer: null,
                    })
                  }
                  className="flex h-10 items-center justify-center border border-white/10 text-[10px] font-bold text-white transition hover:brightness-125"
                  style={{
                    backgroundColor: seat.status
                      ? seatTypeColor[seat.type]
                      : "#ef4444",
                    gridColumn: `span ${seat.span || 1}`,
                  }}
                >
                  {seat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSeatLayout;
