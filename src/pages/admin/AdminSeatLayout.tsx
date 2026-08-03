import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Empty, Modal, Select, Switch } from "antd";
import axios from "axios";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { seatTypeColor } from "../../common/constants";
import { adminService } from "../../common/services/admin.service";
import type { ISeat } from "../../common/types/seat";

const AdminSeatLayout = () => {
  const { roomId = "" } = useParams();
  const [generateType, setGenerateType] = useState<ISeat["type"]>("NORMAL");
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);
  const [editingSeat, setEditingSeat] = useState<ISeat | null>(null);
  const [editType, setEditType] = useState<ISeat["type"]>("NORMAL");
  const [editStatus, setEditStatus] = useState(true);
  const queryClient = useQueryClient();
  const queryKey = ["ADMIN", "SEAT_LAYOUT", roomId];
  const query = useQuery({
    queryKey,
    queryFn: () => adminService.seatLayout(roomId),
    enabled: Boolean(roomId),
  });
  const generate = useMutation({
    mutationFn: () => adminService.generateSeats(roomId, generateType),
    onSuccess: async () => {
      setGenerateConfirmOpen(false);
      setGenerateMessage({
        type: "success",
        content: "Đã sinh sơ đồ ghế thành công.",
      });
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      const responseMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      setGenerateMessage({
        type: "error",
        content:
          responseMessage ||
          "Không thể sinh sơ đồ ghế. Vui lòng kiểm tra lại phòng và đăng nhập admin.",
      });
    },
  });
  const update = useMutation({
    mutationFn: ({
      seatId,
      payload,
    }: {
      seatId: string;
      payload: Pick<ISeat, "type" | "status" | "span">;
    }) => adminService.updateSeat(seatId, payload),
    onSuccess: async () => {
      setEditingSeat(null);
      setGenerateMessage({
        type: "success",
        content: "Đã cập nhật ghế thành công.",
      });
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      const responseMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      setGenerateMessage({
        type: "error",
        content: responseMessage || "Không thể cập nhật ghế.",
      });
    },
  });

  const seats = query.data?.layout.flat() || [];
  const displaySeats =
    query.data?.layout.flatMap((rowSeats) => {
      const coveredColumns = new Set<number>();

      return rowSeats.filter((seat) => {
        if (coveredColumns.has(seat.col)) return false;

        if (seat.type === "COUPLE" && seat.span === 2) {
          coveredColumns.add(seat.col + 1);
        }

        return true;
      });
    }) || [];

  const openSeatEditor = (seat: ISeat) => {
    setGenerateMessage(null);
    setEditingSeat(seat);
    setEditType(seat.type);
    setEditStatus(seat.status);
  };

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
              onClick={() => {
                setGenerateMessage(null);
                setGenerateConfirmOpen(true);
              }}
            >
              Sinh sơ đồ
            </Button>
          </div>
        )}
      </div>

      {generateMessage && (
        <Alert
          className="mt-4"
          type={generateMessage.type}
          message={generateMessage.content}
          showIcon
          closable
          onClose={() => setGenerateMessage(null)}
        />
      )}

      {query.isError && (
        <Alert
          className="mt-4"
          type="error"
          message="Không tải được sơ đồ ghế từ API."
          description="Hãy kiểm tra backend, quyền admin và cấu hình VITE_API_BASE_URL."
          showIcon
        />
      )}

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
              {displaySeats.map((seat) => (
                <button
                  key={seat._id}
                  type="button"
                  title={`${seat.label} · ${seat.type}`}
                  onClick={() => openSeatEditor(seat)}
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

      <Modal
        title="Sinh toàn bộ sơ đồ ghế?"
        open={generateConfirmOpen}
        confirmLoading={generate.isPending}
        okText="Sinh sơ đồ"
        cancelText="Hủy"
        onCancel={() => setGenerateConfirmOpen(false)}
        onOk={() => generate.mutate()}
      >
        <p className="text-[#9A9A9A]">
          Hệ thống sẽ gọi API để sinh toàn bộ ghế theo số hàng và số cột của
          phòng. Sơ đồ chỉ có thể sinh tự động một lần.
        </p>
      </Modal>

      <Modal
        title={`Cập nhật ghế ${editingSeat?.label || ""}`}
        open={Boolean(editingSeat)}
        confirmLoading={update.isPending}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        onCancel={() => setEditingSeat(null)}
        onOk={() => {
          if (!editingSeat) return;

          update.mutate({
            seatId: editingSeat._id,
            payload: {
              type: editType,
              status: editStatus,
              span: editType === "COUPLE" ? 2 : 1,
            },
          });
        }}
      >
        <div className="space-y-5 pt-3">
          <div>
            <p className="mb-2 text-sm font-semibold text-[#F2F2F2]">
              Loại ghế
            </p>
            <Select
              value={editType}
              className="w-full"
              options={[
                { value: "NORMAL", label: "Ghế thường" },
                { value: "VIP", label: "Ghế VIP" },
                {
                  value: "COUPLE",
                  label: "Ghế đôi",
                  disabled: editingSeat?.col === query.data?.room.cols,
                },
              ]}
              onChange={setEditType}
            />
            {editingSeat?.col === query.data?.room.cols && (
              <p className="mt-2 text-xs text-[#9A9A9A]">
                Ghế ở cột cuối không thể đổi thành ghế đôi.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border border-white/10 bg-[#101010] p-3">
            <div>
              <p className="text-sm font-semibold text-[#F2F2F2]">
                Ghế khả dụng
              </p>
              <p className="mt-1 text-xs text-[#9A9A9A]">
                Tắt để đánh dấu ghế không khả dụng.
              </p>
            </div>
            <Switch checked={editStatus} onChange={setEditStatus} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSeatLayout;
