import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { seatTypeColor } from "../../../../../common/constants";
import { SEAT_STATUS_COLOR } from "../../../../../common/constants/seat";
import {
  createBooking,
  createVnpayPayment,
  getShowtimeSeats,
  holdSeats,
} from "../../../../../common/services/booking.service";
import { useAuthSelector } from "../../../../../common/stores/useAuthStore";
import { useCheckoutSelector } from "../../../../../common/stores/useCheckoutStore";
import type { ISeatStatus } from "../../../../../common/types/seat";
import { formatCurrency } from "../../../../../common/utils";

const MAX_SELECTED_SEATS = 8;

const GuideSeat = () => {
  const { showtimeId } = useParams();
  const checkoutRoom = useCheckoutSelector((state) => state.room);
  const showtime = useCheckoutSelector((state) => state.showtime);
  const setInformation = useCheckoutSelector((state) => state.setInformation);
  const user = useAuthSelector((state) => state.user);
  const isAuthenticated = useAuthSelector((state) => state.isAuthenticated);
  const requestLogin = useAuthSelector((state) => state.requestLogin);
  const queryClient = useQueryClient();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const seatsQuery = useQuery({
    queryKey: ["SHOWTIME_SEATS", showtimeId],
    queryFn: () => getShowtimeSeats(showtimeId as string),
    enabled: Boolean(showtimeId),
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    setSelectedSeatIds([]);
    setNotice("");
    setInformation({ seat: [], totalPrice: 0 });
  }, [setInformation, showtimeId]);

  const displayLayout = useMemo(
    () =>
      seatsQuery.data?.layout.map((row) => {
        const coveredColumns = new Set<number>();

        return row.filter((seat) => {
          if (coveredColumns.has(seat.col)) return false;
          if (seat.type === "COUPLE" && seat.span === 2) {
            coveredColumns.add(seat.col + 1);
          }
          return true;
        });
      }) || [],
    [seatsQuery.data?.layout],
  );
  const allSeats = useMemo(() => displayLayout.flat(), [displayLayout]);
  const selectedSeats = allSeats.filter((seat) =>
    selectedSeatIds.includes(seat._id),
  );
  const priceByType = useMemo(
    () =>
      Object.fromEntries(
        (showtime?.price || []).map((price) => [price.seatType, price.value]),
      ),
    [showtime?.price],
  );
  const totalPrice = selectedSeats.reduce(
    (total, seat) => total + Number(priceByType[seat.type] || 0),
    0,
  );

  const checkout = useMutation({
    mutationFn: async () => {
      if (!showtimeId || !selectedSeatIds.length) return;
      await holdSeats(showtimeId, selectedSeatIds);
      const ticket = await createBooking({
        showtimeId,
        seatIds: selectedSeatIds,
        customerName: user?.userName,
        customerEmail: user?.email,
        customerPhone: user?.phone,
      });
      return createVnpayPayment(ticket._id);
    },
    onSuccess: (paymentUrl) => {
      if (paymentUrl) window.location.assign(paymentUrl);
    },
    onError: async (error) => {
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const errors = response?.errors as Record<string, string[]> | undefined;
      setNotice(
        (errors && Object.values(errors).flat()[0]) ||
          response?.message ||
          "Không thể tạo booking. Vui lòng chọn lại ghế.",
      );
      await queryClient.invalidateQueries({
        queryKey: ["SHOWTIME_SEATS", showtimeId],
      });
    },
  });

  useEffect(() => {
    setInformation({
      seat: selectedSeats.map((seat) => ({
        ...seat,
        price: Number(priceByType[seat.type] || 0),
      })),
      totalPrice,
    });
  }, [priceByType, selectedSeats, setInformation, totalPrice]);

  const toggleSeat = (seat: ISeatStatus) => {
    if (!seat.status || seat.bookingStatus !== "AVAILABLE") return;
    setNotice("");
    setSelectedSeatIds((current) => {
      if (current.includes(seat._id)) {
        return current.filter((seatId) => seatId !== seat._id);
      }
      if (current.length >= MAX_SELECTED_SEATS) {
        setNotice(`Bạn chỉ có thể chọn tối đa ${MAX_SELECTED_SEATS} ghế.`);
        return current;
      }
      return [...current, seat._id];
    });
  };

  const getSeatColor = (seat: ISeatStatus) => {
    if (selectedSeatIds.includes(seat._id)) return SEAT_STATUS_COLOR.MYHOLD;
    if (!seat.status || seat.bookingStatus === "BOOKED") {
      return SEAT_STATUS_COLOR.BOOKED;
    }
    if (seat.bookingStatus === "HOLD") return SEAT_STATUS_COLOR.HOLD;
    return seatTypeColor[seat.type];
  };

  const room = seatsQuery.data?.room || checkoutRoom;
  const columnCount = Math.max(room?.cols || 1, 1);
  const seatLegends = [
    { label: "Ghế thường", color: seatTypeColor.NORMAL },
    { label: "Ghế VIP", color: seatTypeColor.VIP },
    { label: "Ghế đôi", color: seatTypeColor.COUPLE },
    { label: "Đang được giữ", color: SEAT_STATUS_COLOR.HOLD },
    { label: "Đã đặt", color: SEAT_STATUS_COLOR.BOOKED },
    { label: "Đang chọn", color: SEAT_STATUS_COLOR.MYHOLD },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-10 lg:pb-16">
      <div className="border border-white/10 bg-[#101010] p-4 sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
            Seat Map
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            Sơ đồ ghế{room?.name ? ` · ${room.name}` : ""}
          </h3>
          {showtime && (
            <p className="mt-2 text-xs text-[#9A9A9A]">
              Suất chiếu {new Date(showtime.startTime).toLocaleString("vi-VN")}
            </p>
          )}
        </div>

        {!showtimeId ? (
          <div className="mt-7 border border-white/10 bg-[#141414] px-5 py-10 text-center text-sm text-[#9A9A9A]">
            Chọn một suất chiếu để xem sơ đồ ghế.
          </div>
        ) : seatsQuery.isLoading ? (
          <div className="mt-7 border border-white/10 bg-[#141414] px-5 py-10 text-center text-sm text-[#9A9A9A]">
            Đang tải sơ đồ ghế...
          </div>
        ) : seatsQuery.isError ? (
          <div className="mt-7 border border-[#DC0000]/30 bg-[#141414] px-5 py-10 text-center text-sm text-[#DC0000]">
            Không thể tải sơ đồ ghế của suất chiếu này.
          </div>
        ) : !allSeats.length ? (
          <div className="mt-7 border border-white/10 bg-[#141414] px-5 py-10 text-center text-sm text-[#9A9A9A]">
            Phòng chiếu chưa có dữ liệu ghế.
          </div>
        ) : (
          <>
            <div className="mt-7 overflow-x-auto pb-3">
              <div
                className="mx-auto"
                style={{
                  minWidth: `${Math.max(312, columnCount * 25 + 24)}px`,
                  maxWidth: `${Math.max(432, columnCount * 34 + 24)}px`,
                }}
              >
                <div className="mx-auto mb-7 flex h-7 w-4/5 items-center justify-center bg-gradient-to-b from-[#F2F2F2] to-[#9A9A9A] text-[9px] font-black uppercase tracking-[0.22em] text-[#0A0A0A] [clip-path:polygon(5%_0,95%_0,100%_100%,0_100%)]">
                  Màn hình
                </div>
                <div className="space-y-1">
                  {displayLayout.map((row) => (
                    <div
                      key={row[0]?._id}
                      className="grid items-center gap-1"
                      style={{
                        gridTemplateColumns: `16px repeat(${columnCount}, minmax(20px, 1fr))`,
                      }}
                    >
                      <span className="text-center text-[10px] font-bold text-[#666666]">
                        {row[0]?.label.charAt(0)}
                      </span>
                      {row.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat._id);
                        const isBlocked =
                          !seat.status || seat.bookingStatus !== "AVAILABLE";
                        return (
                          <button
                            key={seat._id}
                            type="button"
                            disabled={isBlocked}
                            aria-pressed={isSelected}
                            aria-label={`Ghế ${seat.label}, ${seat.type}, ${seat.bookingStatus}`}
                            onClick={() => toggleSeat(seat)}
                            className="aspect-square min-w-5 border border-white/10 text-[7px] font-bold text-white transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2F2F2] disabled:cursor-not-allowed disabled:opacity-65"
                            style={{
                              gridColumn: `${seat.col + 1} / span ${seat.span || 1}`,
                              aspectRatio: seat.span === 2 ? "2 / 1" : "1 / 1",
                              backgroundColor: getSeatColor(seat),
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

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9A9A9A]">
                Ghế đang chọn
              </p>
              <p className="mt-2 min-h-5 text-sm font-bold">
                {selectedSeats.map((seat) => seat.label).join(", ") ||
                  "Chưa chọn ghế"}
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
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedSeatIds.length || checkout.isPending}
                  onClick={() => {
                    if (!isAuthenticated) {
                      requestLogin({ action: () => checkout.mutate() });
                      return;
                    }
                    checkout.mutate();
                  }}
                  className="min-h-11 bg-[#DC0000] px-6 text-xs font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition hover:bg-[#F2F2F2] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {checkout.isPending
                    ? "Đang tạo thanh toán..."
                    : "Thanh toán qua VNPAY"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-5 border border-white/10 bg-[#141414] p-4 lg:p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9A9A9A]">
          Chú thích
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {seatLegends.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-xs text-[#B8B8B8]"
            >
              <span
                className="h-5 w-5 shrink-0 border border-white/10"
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
