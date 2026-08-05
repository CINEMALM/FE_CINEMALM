import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Empty, InputNumber, Modal, Select, Switch } from "antd";
import axios from "axios";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { adminService } from "../../common/services/admin.service";
import type { ISeat } from "../../common/types/seat";
import SeatIcon from "../../components/SeatIcon";

type SeatType = ISeat["type"];
type LayoutPreset =
  | "standard"
  | "normal_only"
  | "vip_center"
  | "premium"
  | "custom";
type SeatZone = {
  row_from: number;
  row_to: number;
  col_from: number;
  col_to: number;
  type: SeatType;
};

const AVAILABLE_SEAT_COLOR = "#70737C";

const seatTypeOptions: Array<{ value: SeatType; label: string }> = [
  { value: "NORMAL", label: "Ghế thường" },
  { value: "VIP", label: "Ghế VIP" },
  { value: "COUPLE", label: "Ghế đôi" },
];

const presetOptions: Array<{
  value: LayoutPreset;
  label: string;
  description: string;
}> = [
  {
    value: "standard",
    label: "Chuẩn rạp",
    description: "Hàng trước ghế thường, hàng giữa VIP, hàng cuối ghế đôi.",
  },
  {
    value: "vip_center",
    label: "VIP giữa phòng",
    description: "Hai bên ghế thường, khu trung tâm là VIP.",
  },
  {
    value: "premium",
    label: "Premium",
    description: "Nhiều hàng VIP và 2 hàng cuối ghế đôi.",
  },
  {
    value: "normal_only",
    label: "Toàn ghế thường",
    description: "Dùng cho phòng nhỏ hoặc demo đơn giản.",
  },
  {
    value: "custom",
    label: "Tự chia vùng",
    description: "Tự chọn hàng/cột cho từng loại ghế.",
  },
];

const defaultZones: SeatZone[] = [
  { row_from: 1, row_to: 3, col_from: 1, col_to: 12, type: "NORMAL" },
  { row_from: 4, row_to: 6, col_from: 1, col_to: 12, type: "VIP" },
  { row_from: 7, row_to: 8, col_from: 1, col_to: 12, type: "COUPLE" },
];

const AdminSeatLayout = () => {
  const { roomId = "" } = useParams();
  const [layoutPreset, setLayoutPreset] = useState<LayoutPreset>("standard");
  const [customZones, setCustomZones] = useState<SeatZone[]>(defaultZones);
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<{
    type: "success" | "error";
    content: string;
  } | null>(null);
  const [editingSeat, setEditingSeat] = useState<ISeat | null>(null);
  const [editType, setEditType] = useState<SeatType>("NORMAL");
  const [editStatus, setEditStatus] = useState(true);
  const queryClient = useQueryClient();
  const queryKey = ["ADMIN", "SEAT_LAYOUT", roomId];
  const query = useQuery({
    queryKey,
    queryFn: () => adminService.seatLayout(roomId),
    enabled: Boolean(roomId),
  });

  const roomRows = query.data?.room.rows || 1;
  const roomCols = query.data?.room.cols || 1;
  const selectedPreset = presetOptions.find(
    (item) => item.value === layoutPreset,
  );
  const normalizedCustomZones = customZones.map((zone) => ({
    ...zone,
    row_from: Math.min(Math.max(zone.row_from, 1), roomRows),
    row_to: Math.min(Math.max(zone.row_to, 1), roomRows),
    col_from: Math.min(Math.max(zone.col_from, 1), roomCols),
    col_to: Math.min(Math.max(zone.col_to, 1), roomCols),
  }));

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

  const generate = useMutation({
    mutationFn: () =>
      adminService.generateSeats(
        roomId,
        layoutPreset === "custom"
          ? { zones: normalizedCustomZones }
          : { preset: layoutPreset },
      ),
    onSuccess: async () => {
      setGenerateConfirmOpen(false);
      setGenerateMessage({
        type: "success",
        content: "Đã sinh sơ đồ ghế thành công.",
      });
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const errors = response?.errors as Record<string, string[]> | undefined;
      setGenerateMessage({
        type: "error",
        content:
          (errors && Object.values(errors).flat()[0]) ||
          response?.message ||
          "Không thể sinh sơ đồ ghế. Vui lòng kiểm tra lại phòng và quyền admin.",
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
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const errors = response?.errors as Record<string, string[]> | undefined;
      setGenerateMessage({
        type: "error",
        content:
          (errors && Object.values(errors).flat()[0]) ||
          response?.message ||
          "Không thể cập nhật ghế.",
      });
    },
  });

  const updateZone = (index: number, payload: Partial<SeatZone>) => {
    setCustomZones((current) =>
      current.map((zone, zoneIndex) =>
        zoneIndex === index ? { ...zone, ...payload } : zone,
      ),
    );
  };

  const addZone = () => {
    setCustomZones((current) => [
      ...current,
      {
        row_from: 1,
        row_to: roomRows,
        col_from: 1,
        col_to: roomCols,
        type: "NORMAL",
      },
    ]);
  };

  const removeZone = (index: number) => {
    setCustomZones((current) =>
      current.filter((_, zoneIndex) => zoneIndex !== index),
    );
  };

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
          <div className="flex flex-wrap gap-2">
            <Select
              value={layoutPreset}
              onChange={setLayoutPreset}
              options={presetOptions.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              className="w-52"
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

      {!query.isLoading && seats.length === 0 && (
        <section className="mt-4 border border-white/10 bg-[#101010] p-4">
          <p className="text-sm font-bold text-[#F2F2F2]">
            {selectedPreset?.label}
          </p>
          <p className="mt-1 text-xs text-[#9A9A9A]">
            {selectedPreset?.description}
          </p>

          {layoutPreset === "custom" && (
            <div className="mt-4 space-y-3">
              {customZones.map((zone, index) => (
                <div
                  key={index}
                  className="grid gap-3 border border-white/10 bg-[#0A0A0A] p-3 md:grid-cols-[1fr_1fr_1fr_1fr_160px_auto]"
                >
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase text-[#9A9A9A]">
                      Hàng từ
                    </p>
                    <InputNumber
                      min={1}
                      max={roomRows}
                      value={zone.row_from}
                      onChange={(value) =>
                        updateZone(index, { row_from: Number(value || 1) })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase text-[#9A9A9A]">
                      Hàng đến
                    </p>
                    <InputNumber
                      min={1}
                      max={roomRows}
                      value={zone.row_to}
                      onChange={(value) =>
                        updateZone(index, { row_to: Number(value || 1) })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase text-[#9A9A9A]">
                      Cột từ
                    </p>
                    <InputNumber
                      min={1}
                      max={roomCols}
                      value={zone.col_from}
                      onChange={(value) =>
                        updateZone(index, { col_from: Number(value || 1) })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase text-[#9A9A9A]">
                      Cột đến
                    </p>
                    <InputNumber
                      min={1}
                      max={roomCols}
                      value={zone.col_to}
                      onChange={(value) =>
                        updateZone(index, { col_to: Number(value || 1) })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase text-[#9A9A9A]">
                      Loại ghế
                    </p>
                    <Select
                      value={zone.type}
                      onChange={(value) => updateZone(index, { type: value })}
                      options={seatTypeOptions}
                      className="w-full"
                    />
                  </div>
                  <Button danger onClick={() => removeZone(index)}>
                    Xóa
                  </Button>
                </div>
              ))}
              <Button onClick={addZone}>Thêm vùng ghế</Button>
              <Alert
                type="info"
                showIcon
                message="Lưu ý ghế đôi"
                description="Vùng ghế đôi phải bắt đầu ở cột lẻ và có số cột chẵn, ví dụ cột 1-12 hoặc 3-10."
              />
            </div>
          )}
        </section>
      )}

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
              className="mx-auto grid min-w-max items-center gap-x-3 gap-y-4"
              style={{
                gridTemplateColumns: `repeat(${query.data?.room.cols}, 52px)`,
              }}
            >
              {displaySeats.map((seat) => (
                <button
                  key={seat._id}
                  type="button"
                  title={`${seat.label} · ${seat.type}`}
                  onClick={() => openSeatEditor(seat)}
                  className="group flex h-12 items-center justify-center text-[10px] font-bold text-white transition hover:brightness-125"
                  style={{
                    gridColumn: `span ${seat.span || 1}`,
                  }}
                >
                  <SeatIcon
                    type={seat.type}
                    color={seat.status ? AVAILABLE_SEAT_COLOR : "#ef4444"}
                    label={seat.label}
                    className="brightness-75 transition group-hover:brightness-100"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        title="Sinh sơ đồ ghế?"
        open={generateConfirmOpen}
        confirmLoading={generate.isPending}
        okText="Sinh sơ đồ"
        cancelText="Hủy"
        onCancel={() => setGenerateConfirmOpen(false)}
        onOk={() => generate.mutate()}
      >
        <div className="space-y-3 text-[#9A9A9A]">
          <p>
            Hệ thống sẽ sinh toàn bộ ghế theo kích thước phòng. Sơ đồ chỉ được
            sinh tự động một lần trước khi phòng có suất chiếu hoặc lịch sử vé.
          </p>
          <p>
            Mẫu đang chọn:{" "}
            <span className="font-bold text-[#F2F2F2]">
              {selectedPreset?.label}
            </span>
          </p>
        </div>
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
              options={seatTypeOptions.map((option) => ({
                ...option,
                disabled:
                  option.value === "COUPLE" &&
                  editingSeat?.col === query.data?.room.cols,
              }))}
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
                Tắt để đánh dấu ghế không khả dụng hoặc phần ghế bị ghép.
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
