import { ClockCircleOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { seatTypeColor } from "../../../../../common/constants";
import { SEAT_STATUS_COLOR } from "../../../../../common/constants/seat";
import { formatCurrency } from "../../../../../common/utils";
import { mockGuideSeats, type MockGuideSeat } from "../mockDetailData";

const HOLD_DURATION_MS = 5 * 60 * 1000;
const MAX_SELECTED_SEATS = 8;

interface LocalSeatHold {
  seatIds: string[];
  expiresAt: number;
}

const seatPrices: Record<MockGuideSeat["type"], number> = {
  NORMAL: 70000,
  VIP: 90000,
  COUPLE: 180000,
};

const getMockSeatColor = (
  seat: MockGuideSeat,
  isSelected: boolean,
  isMyHold: boolean,
) => {
  if (isSelected || isMyHold) return SEAT_STATUS_COLOR.MYHOLD;
  if (seat.state === "unavailable") return "#ef4444";
  return seatTypeColor[seat.type];
};

const GuideSeat = () => {
  const { id, showtimeId = "preview" } = useParams();
  const storageKey = `cinemalm:mock-seat-hold:${id || "movie"}:${showtimeId}`;
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [heldSeatIds, setHeldSeatIds] = useState<string[]>([]);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [notice, setNotice] = useState("");

  const allSeats = useMemo(() => mockGuideSeats.flat(), []);
  const selectedSeats = allSeats.filter((seat) =>
    selectedSeatIds.includes(seat.id),
  );
  const heldSeats = allSeats.filter((seat) => heldSeatIds.includes(seat.id));
  const totalPrice = [...heldSeats, ...selectedSeats].reduce(
    (total, seat) => total + seatPrices[seat.type],
    0,
  );

  useEffect(() => {
    const rawHold = window.localStorage.getItem(storageKey);
    if (!rawHold) return;

    try {
      const localHold = JSON.parse(rawHold) as LocalSeatHold;
      if (localHold.expiresAt <= Date.now()) {
        window.localStorage.removeItem(storageKey);
        return;
      }
      const availableSeatIds = new Set(
        allSeats
          .filter((seat) => seat.state !== "unavailable")
          .map((seat) => seat.id),
      );
      const validHeldSeatIds = localHold.seatIds.filter((seatId) =>
        availableSeatIds.has(seatId),
      );

      if (!validHeldSeatIds.length) {
        window.localStorage.removeItem(storageKey);
        return;
      }

      setHeldSeatIds(validHeldSeatIds);
      setHoldExpiresAt(localHold.expiresAt);
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          seatIds: validHeldSeatIds,
          expiresAt: localHold.expiresAt,
        } satisfies LocalSeatHold),
      );
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [allSeats, storageKey]);

  useEffect(() => {
    if (!holdExpiresAt) {
      setRemainingSeconds(0);
      return;
    }

    const updateCountdown = () => {
      const seconds = Math.max(
        0,
        Math.ceil((holdExpiresAt - Date.now()) / 1000),
      );
      setRemainingSeconds(seconds);

      if (seconds === 0) {
        setHeldSeatIds([]);
        setHoldExpiresAt(null);
        window.localStorage.removeItem(storageKey);
        setNotice("Thời gian giữ ghế đã hết. Vui lòng chọn lại ghế.");
      }
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [holdExpiresAt, storageKey]);

  const persistHold = (seatIds: string[], expiresAt: number) => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ seatIds, expiresAt } satisfies LocalSeatHold),
    );
  };

  const toggleSeat = (seat: MockGuideSeat) => {
    if (seat.state === "unavailable") return;

    setNotice("");

    if (heldSeatIds.includes(seat.id)) {
      const nextHeldSeats = heldSeatIds.filter((seatId) => seatId !== seat.id);
      setHeldSeatIds(nextHeldSeats);

      if (!nextHeldSeats.length) {
        setHoldExpiresAt(null);
        window.localStorage.removeItem(storageKey);
      } else if (holdExpiresAt) {
        persistHold(nextHeldSeats, holdExpiresAt);
      }
      return;
    }

    setSelectedSeatIds((current) => {
      if (current.includes(seat.id)) {
        return current.filter((seatId) => seatId !== seat.id);
      }
      if (current.length + heldSeatIds.length >= MAX_SELECTED_SEATS) {
        setNotice(`Bạn chỉ có thể chọn tối đa ${MAX_SELECTED_SEATS} ghế.`);
        return current;
      }
      return [...current, seat.id];
    });
  };

  const holdSelectedSeats = () => {
    if (!selectedSeatIds.length) {
      setNotice("Vui lòng chọn ít nhất một ghế.");
      return;
    }

    const nextHeldSeats = Array.from(
      new Set([...heldSeatIds, ...selectedSeatIds]),
    );
    const expiresAt = Date.now() + HOLD_DURATION_MS;

    persistHold(nextHeldSeats, expiresAt);
    setHeldSeatIds(nextHeldSeats);
    setSelectedSeatIds([]);
    setHoldExpiresAt(expiresAt);
    setNotice("Đã giữ ghế trên thiết bị này trong 5 phút.");
  };

  const clearSelection = () => {
    setSelectedSeatIds([]);
    setHeldSeatIds([]);
    setHoldExpiresAt(null);
    setNotice("");
    window.localStorage.removeItem(storageKey);
  };

  const countdownLabel = `${String(Math.floor(remainingSeconds / 60)).padStart(
    2,
    "0",
  )}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  const seatLegends = [
    { label: "Ghế thường", color: seatTypeColor.NORMAL },
    { label: "Ghế VIP", color: seatTypeColor.VIP },
    { label: "Ghế đôi", color: seatTypeColor.COUPLE },
    { label: "Ghế không khả dụng", color: "#ef4444" },
    { label: "Ghế của tôi", color: SEAT_STATUS_COLOR.MYHOLD },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-10 lg:pb-16">
      <div className="border border-white/10 bg-[#101010] p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
              Seat Preview
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              Sơ đồ ghế mẫu
            </h3>
          </div>
          <div className="text-xs text-[#9A9A9A] sm:text-right">
            <p>Dữ liệu minh họa — lưu trên thiết bị hiện tại</p>
            {holdExpiresAt && remainingSeconds > 0 && (
              <p className="mt-1 flex items-center gap-1.5 font-bold text-[#DC0000] sm:justify-end">
                <ClockCircleOutlined />
                Giữ ghế còn {countdownLabel}
              </p>
            )}
          </div>
        </div>

        <div className="mt-7 overflow-x-auto pb-3">
          <div className="mx-auto min-w-[520px] max-w-[720px]">
            <div className="mx-auto mb-7 flex h-7 w-4/5 items-center justify-center bg-gradient-to-b from-[#F2F2F2] to-[#9A9A9A] text-[9px] font-black uppercase tracking-[0.22em] text-[#0A0A0A] [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]">
              Màn hình
            </div>

            <div className="space-y-1.5">
              {mockGuideSeats.map((row) => (
                <div
                  key={row[0].label.charAt(0)}
                  className="grid grid-cols-[24px_repeat(10,minmax(32px,1fr))] items-center gap-1.5"
                >
                  <span className="text-center text-[10px] font-bold text-[#666666]">
                    {row[0].label.charAt(0)}
                  </span>
                  {row.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isMyHold = heldSeatIds.includes(seat.id);
                    const isBlocked = seat.state === "unavailable";

                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={isBlocked}
                        aria-pressed={isSelected || isMyHold}
                        aria-label={`Ghế ${seat.label}, ${seat.type}, ${
                          isMyHold
                            ? "đang được bạn giữ"
                            : isSelected
                              ? "đã chọn"
                              : seat.state
                        }`}
                        onClick={() => toggleSeat(seat)}
                        className="aspect-square min-w-8 border border-white/10 text-[8px] font-bold text-white transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2F2F2] disabled:cursor-not-allowed disabled:opacity-55"
                        style={{
                          gridColumn: `span ${seat.span || 1} / span ${
                            seat.span || 1
                          }`,
                          aspectRatio: seat.span === 2 ? "2 / 1" : "1 / 1",
                          backgroundColor: getMockSeatColor(
                            seat,
                            isSelected,
                            isMyHold,
                          ),
                        }}
                      >
                        {seat.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9A9A9A]">
              Ghế đã chọn / đang giữ
            </p>
            <p className="mt-2 min-h-5 text-sm font-bold">
              {[...heldSeats, ...selectedSeats]
                .map((seat) => seat.label)
                .join(", ") || "Chưa chọn ghế"}
            </p>
            <p className="mt-1 text-sm text-[#9A9A9A]">
              Tạm tính:{" "}
              <span className="font-black text-[#F2F2F2]">
                {formatCurrency(totalPrice)}
              </span>
            </p>
            {notice && (
              <p className="mt-2 text-xs text-[#DC0000]" role="status">
                {notice}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={clearSelection}
              disabled={!selectedSeatIds.length && !heldSeatIds.length}
              className="min-h-10 border border-white/15 px-4 text-[10px] font-black uppercase tracking-[0.12em] transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Chọn lại
            </button>
            <button
              type="button"
              onClick={holdSelectedSeats}
              disabled={!selectedSeatIds.length}
              className="min-h-10 bg-[#DC0000] px-5 text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A] transition hover:bg-[#F2F2F2] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Giữ {selectedSeatIds.length || ""} ghế
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 border border-white/10 bg-[#141414] p-4 lg:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9A9A9A]">
          Chú thích
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {seatLegends.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-xs text-[#B8B8B8]"
            >
              <span
                className="h-7 w-7 shrink-0 border border-white/10"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuideSeat;
