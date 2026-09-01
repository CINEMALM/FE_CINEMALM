import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { SEAT_STATUS_COLOR } from "../../../../../common/constants/seat";
import {
  createBooking,
  createVnpayPayment,
  getProducts,
  getShowtimeSeats,
  holdSeats,
  previewPromotions,
  releaseSeats,
} from "../../../../../common/services/booking.service";
import { subscribeShowtimeSeatEvents } from "../../../../../common/services/realtime.service";
import { useAuthSelector } from "../../../../../common/stores/useAuthStore";
import { useCheckoutSelector } from "../../../../../common/stores/useCheckoutStore";
import type { ISeatStatus } from "../../../../../common/types/seat";
import { formatCurrency } from "../../../../../common/utils";

const MAX_SELECTED_SEATS = 8;
const AVAILABLE_SEAT_COLOR = "#70737C";

const formatCountdown = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(
    2,
    "0",
  )}`;
};

const seatHoldRemaining = (
  heldUntil: string | null | undefined,
  now: number,
) => {
  if (!heldUntil) return null;
  const deadline = Date.parse(heldUntil);
  if (!Number.isFinite(deadline)) return null;
  return Math.max(0, Math.ceil((deadline - now) / 1000));
};

const resolveHoldDeadline = (payload?: {
  held_until?: string | null;
  hold_expires_in?: number;
  server_time?: string;
}) => {
  if (!payload) return null;

  const heldUntil = payload.held_until ? Date.parse(payload.held_until) : NaN;
  if (Number.isFinite(heldUntil)) return heldUntil;

  const serverTime = payload.server_time
    ? Date.parse(payload.server_time)
    : NaN;
  const expiresIn = Number(payload.hold_expires_in || 0);

  if (Number.isFinite(serverTime) && expiresIn > 0) {
    return serverTime + expiresIn * 1000;
  }

  if (expiresIn > 0) return Date.now() + expiresIn * 1000;

  return null;
};

const seatShapeClass = (type: ISeatStatus["type"], compact = false) => {
  if (type === "NORMAL") {
    return compact
      ? "h-5 w-7 rounded-t-[7px] rounded-b-[2px]"
      : "h-6 w-[78%] justify-self-center rounded-t-[7px] rounded-b-[2px] sm:h-7 lg:h-8";
  }
  if (type === "VIP") {
    return compact
      ? "h-7 w-9 rounded-t-[11px] rounded-b-[4px]"
      : "h-8 w-full rounded-t-[12px] rounded-b-[4px] border-2 sm:h-10 lg:h-11";
  }
  return compact
    ? "h-7 w-12 rounded-t-[11px] rounded-b-[4px]"
    : "h-8 w-full rounded-t-[13px] rounded-b-[4px] border-2 sm:h-10 lg:h-11";
};

const SeatIcon = ({
  type,
  color,
  label,
  compact = false,
  darkText = false,
}: {
  type: ISeatStatus["type"];
  color: string;
  label?: string;
  compact?: boolean;
  darkText?: boolean;
}) => (
  <span
    className={`relative flex shrink-0 items-center justify-center border border-white/15 font-black shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)] ${seatShapeClass(
      type,
      compact,
    )} ${darkText ? "text-[#111318]" : "text-white"}`}
    style={{ backgroundColor: color }}
  >
    {type === "VIP" && (
      <>
        <span className="absolute inset-x-[20%] bottom-1 top-[24%] rounded-t-lg border border-black/15 shadow-inner" />
        <span
          className={`absolute -left-1 bottom-0 rounded-full opacity-70 ${
            compact ? "h-3 w-1.5" : "h-1/2 w-2"
          }`}
          style={{ backgroundColor: color }}
        />
        <span
          className={`absolute -right-1 bottom-0 rounded-full opacity-70 ${
            compact ? "h-3 w-1.5" : "h-1/2 w-2"
          }`}
          style={{ backgroundColor: color }}
        />
      </>
    )}
    {type === "COUPLE" && (
      <span className="absolute inset-y-1 left-1/2 w-px bg-black/15" />
    )}
    {label && <span className="relative z-10">{label}</span>}
    <span
      aria-hidden="true"
      className="absolute -bottom-1 left-[-2px] h-1.5 w-[calc(100%+4px)] rounded-full opacity-85"
      style={{ backgroundColor: color }}
    />
  </span>
);

const isUnavailableSeat = (
  seat: ISeatStatus,
  selectedSeatIds: string[],
  userId?: string,
) =>
  selectedSeatIds.includes(seat._id) ||
  !seat.status ||
  (seat.bookingStatus !== "AVAILABLE" &&
    !(seat.bookingStatus === "HOLD" && seat.userId === userId));

const createsSingleSeatGap = (
  layout: ISeatStatus[][],
  nextSelectedIds: string[],
  userId?: string,
) =>
  layout.some((row) => {
    const orderedSeats = [...row].sort((left, right) => left.col - right.col);

    return orderedSeats.some((seat, index) => {
      if (
        isUnavailableSeat(seat, nextSelectedIds, userId) ||
        index === 0 ||
        index === orderedSeats.length - 1
      ) {
        return false;
      }

      const previous = orderedSeats[index - 1];
      const next = orderedSeats[index + 1];
      const isPhysicallyBetween =
        previous.col + Math.max(previous.span || 1, 1) === seat.col &&
        seat.col + Math.max(seat.span || 1, 1) === next.col;

      return (
        isPhysicallyBetween &&
        isUnavailableSeat(previous, nextSelectedIds, userId) &&
        isUnavailableSeat(next, nextSelectedIds, userId)
      );
    });
  });

const GuideSeat = () => {
  const { id: movieId, showtimeId: routeShowtimeId } = useParams();
  const checkoutRoom = useCheckoutSelector((state) => state.room);
  const showtime = useCheckoutSelector((state) => state.showtime);
  const showtimeId =
    showtime && showtime.movieId?._id === movieId
      ? showtime._id
      : routeShowtimeId;
  const setInformation = useCheckoutSelector((state) => state.setInformation);
  const user = useAuthSelector((state) => state.user);
  const isAuthenticated = useAuthSelector((state) => state.isAuthenticated);
  const requestLogin = useAuthSelector((state) => state.requestLogin);
  const queryClient = useQueryClient();
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});
  const [voucherCode, setVoucherCode] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [holdDeadline, setHoldDeadline] = useState<number | null>(null);
  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState(0);
  const [seatClockNow, setSeatClockNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setSeatClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const seatsQuery = useQuery({
    queryKey: ["SHOWTIME_SEATS", showtimeId],
    queryFn: () => getShowtimeSeats(showtimeId as string),
    enabled: Boolean(showtimeId),
    refetchOnWindowFocus: true,
    // Reverb remains the primary realtime path. This low-frequency fallback
    // heals stale seat state if a browser temporarily loses its WebSocket.
    refetchInterval: 5000,
  });
  const productsQuery = useQuery({
    queryKey: ["PRODUCTS"],
    queryFn: getProducts,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!showtimeId) return;

    return subscribeShowtimeSeatEvents(showtimeId, (event) => {
      queryClient.setQueryData<Awaited<ReturnType<typeof getShowtimeSeats>>>(
        ["SHOWTIME_SEATS", showtimeId],
        (current) => {
          if (!current) return current;

          const eventSeats = new Map(
            event.seats.map((seat) => [
              String(seat.seat_id),
              {
                bookingStatus: seat.status,
                userId: seat.user_id == null ? null : String(seat.user_id),
                heldUntil: seat.held_until,
                holdContext: seat.hold_context,
                countdownUntil: seat.countdown_until || seat.held_until,
              },
            ]),
          );

          return {
            ...current,
            layout: current.layout.map((row) =>
              row.map((seat) => {
                const realtimeSeat = eventSeats.get(seat._id);
                return realtimeSeat ? { ...seat, ...realtimeSeat } : seat;
              }),
            ),
          };
        },
      );

      setSelectedSeatIds((current) => {
        const blockedSeatIds = event.seats
          .filter((seat) => {
            const seatUserId =
              seat.user_id == null ? null : String(seat.user_id);
            return seat.status !== "AVAILABLE" && seatUserId !== user?._id;
          })
          .map((seat) => String(seat.seat_id));

        if (!blockedSeatIds.some((seatId) => current.includes(seatId))) {
          return current;
        }

        setNotice("Một số ghế bạn đang chọn vừa được cập nhật bởi người khác.");
        return current.filter((seatId) => !blockedSeatIds.includes(seatId));
      });
    });
  }, [queryClient, showtimeId, user?._id]);

  useEffect(() => {
    setSelectedSeatIds([]);
    setNotice("");
    setProductQuantities({});
    setVoucherCode("");
    setIsCheckoutOpen(false);
    setHoldDeadline(null);
    setHoldRemainingSeconds(0);
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
  const selectedProductItems = useMemo(
    () =>
      Object.entries(productQuantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([product_variant_id, quantity]) => ({
          product_variant_id: Number(product_variant_id),
          quantity,
        })),
    [productQuantities],
  );
  const localProductAmount = useMemo(() => {
    const priceByVariant = Object.fromEntries(
      (productsQuery.data || []).flatMap((product) =>
        product.variants.map((variant) => [
          String(variant.id),
          Number(variant.price || 0),
        ]),
      ),
    );

    return selectedProductItems.reduce(
      (total, item) =>
        total +
        Number(priceByVariant[String(item.product_variant_id)] || 0) *
          item.quantity,
      0,
    );
  }, [productsQuery.data, selectedProductItems]);
  const promotionPreview = useQuery({
    queryKey: [
      "PROMOTION_PREVIEW",
      showtimeId,
      selectedSeatIds,
      selectedProductItems,
      voucherCode.trim(),
    ],
    queryFn: () =>
      previewPromotions({
        showtimeId: showtimeId as string,
        seatIds: selectedSeatIds,
        productItems: selectedProductItems,
        voucherCode: voucherCode.trim(),
      }),
    enabled: Boolean(
      isCheckoutOpen && showtimeId && selectedSeatIds.length && isAuthenticated,
    ),
    retry: false,
  });
  const finalTotal =
    promotionPreview.data?.total_amount ?? totalPrice + localProductAmount;
  const selectedShowtimePrices = showtime?.price || [];

  useEffect(() => {
    if (!holdDeadline || !selectedSeatIds.length) {
      setHoldRemainingSeconds(0);
      return;
    }

    const updateRemaining = () => {
      setHoldRemainingSeconds(
        Math.max(0, Math.ceil((holdDeadline - Date.now()) / 1000)),
      );
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);

    return () => window.clearInterval(timer);
  }, [holdDeadline, selectedSeatIds.length]);

  useEffect(() => {
    if (!holdDeadline || !selectedSeatIds.length) {
      return;
    }

    if (Date.now() < holdDeadline) {
      return;
    }

    const expiredSeatIds = [...selectedSeatIds];
    setSelectedSeatIds([]);
    setHoldDeadline(null);
    setHoldRemainingSeconds(0);
    setIsCheckoutOpen(false);
    setNotice("Thời gian giữ ghế đã hết. Vui lòng chọn lại ghế.");

    void releaseSeats(showtimeId as string, expiredSeatIds).catch(() => {
      // Backend/job may have already released these seats. The invalidate below
      // keeps the UI in sync either way.
    });

    void queryClient.invalidateQueries({
      queryKey: ["SHOWTIME_SEATS", showtimeId],
    });
  }, [
    holdDeadline,
    holdRemainingSeconds,
    queryClient,
    selectedSeatIds,
    showtimeId,
  ]);

  const checkout = useMutation({
    mutationFn: async () => {
      if (!showtimeId || !selectedSeatIds.length) return;
      const ticket = await createBooking({
        showtimeId,
        seatIds: selectedSeatIds,
        customerName: user?.userName,
        customerEmail: user?.email,
        customerPhone: user?.phone,
        productItems: selectedProductItems,
        voucherCode: voucherCode.trim(),
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

  const holdSelection = useMutation({
    scope: { id: "client-seat-selection" },
    mutationFn: (seatIds: string[]) => {
      if (!showtimeId) throw new Error("Missing showtime");
      return holdSeats(showtimeId, seatIds);
    },
    onError: async (error) => {
      const response = axios.isAxiosError(error) ? error.response?.data : null;
      const errors = response?.errors as Record<string, string[]> | undefined;
      setNotice(
        (errors && Object.values(errors).flat()[0]) ||
          response?.message ||
          "Không thể giữ ghế. Vui lòng chọn lại.",
      );
      setSelectedSeatIds([]);
      await queryClient.invalidateQueries({
        queryKey: ["SHOWTIME_SEATS", showtimeId],
      });
    },
  });

  const releaseSelection = useMutation({
    scope: { id: "client-seat-selection" },
    mutationFn: (seatIds: string[]) => {
      if (!showtimeId) throw new Error("Missing showtime");
      return releaseSeats(showtimeId, seatIds);
    },
    onError: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["SHOWTIME_SEATS", showtimeId],
      });
    },
  });

  useEffect(() => {
    if (!showtimeId || !user?._id || !seatsQuery.data) return;
    if (holdSelection.isPending || releaseSelection.isPending) return;

    const ownedSelectionSeats = seatsQuery.data.layout
      .flat()
      .filter(
        (seat) =>
          seat.bookingStatus === "HOLD" &&
          seat.userId === user._id &&
          seat.holdContext === "SELECTION",
      );
    const restoredSeatIds = ownedSelectionSeats.map((seat) => seat._id);

    setSelectedSeatIds((current) => {
      if (
        current.length === restoredSeatIds.length &&
        current.every((seatId) => restoredSeatIds.includes(seatId))
      ) {
        return current;
      }

      return restoredSeatIds;
    });

    const restoredDeadlines = ownedSelectionSeats
      .map((seat) => Date.parse(seat.countdownUntil || seat.heldUntil || ""))
      .filter((deadline) => Number.isFinite(deadline) && deadline > Date.now());

    if (!restoredSeatIds.length || !restoredDeadlines.length) {
      setHoldDeadline(null);
      setHoldRemainingSeconds(0);
      setIsCheckoutOpen(false);
      return;
    }

    // All seats in one selection session share the same deadline. Using the
    // earliest value also prevents inconsistent data from extending a session.
    setHoldDeadline(Math.min(...restoredDeadlines));
  }, [
    holdSelection.isPending,
    releaseSelection.isPending,
    seatsQuery.data,
    showtimeId,
    user?._id,
  ]);

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
    if (!isAuthenticated) {
      requestLogin();
      return;
    }
    if (
      !seat.status ||
      (seat.bookingStatus !== "AVAILABLE" &&
        !(seat.bookingStatus === "HOLD" && seat.userId === user?._id))
    ) {
      return;
    }
    setNotice("");
    const isAlreadySelected = selectedSeatIds.includes(seat._id);

    if (isAlreadySelected) {
      const nextSeatIds = selectedSeatIds.filter(
        (seatId) => seatId !== seat._id,
      );
      if (createsSingleSeatGap(displayLayout, nextSeatIds, user?._id)) {
        setNotice("Không thể bỏ ghế này vì sẽ tạo một ghế trống đơn ở giữa.");
        return;
      }
      setSelectedSeatIds(nextSeatIds);
      releaseSelection.mutate([seat._id], {
        onSuccess: () => {
          if (!nextSeatIds.length) {
            setHoldDeadline(null);
            setHoldRemainingSeconds(0);
            setIsCheckoutOpen(false);
          }
        },
      });
      return;
    }

    if (selectedSeatIds.length >= MAX_SELECTED_SEATS) {
      setNotice(`Bạn chỉ có thể chọn tối đa ${MAX_SELECTED_SEATS} ghế.`);
      return;
    }

    const nextSeatIds = [...selectedSeatIds, seat._id];
    if (createsSingleSeatGap(displayLayout, nextSeatIds, user?._id)) {
      setNotice(
        "Vui lòng không để trống một ghế đơn ở giữa các ghế đã chọn hoặc đã đặt.",
      );
      return;
    }

    setSelectedSeatIds(nextSeatIds);
    holdSelection.mutate(nextSeatIds, {
      onSuccess: (payload) => {
        const responseDeadline = resolveHoldDeadline(payload);
        setHoldDeadline((currentDeadline) => {
          if (!responseDeadline) return currentDeadline;
          if (!currentDeadline || currentDeadline <= Date.now()) {
            return responseDeadline;
          }

          // The first selected seat starts one fixed hold session. Adding more
          // seats must never extend that session, even if an older API returns
          // a freshly calculated five-minute deadline.
          return Math.min(currentDeadline, responseDeadline);
        });
      },
    });
  };

  const getSeatColor = (seat: ISeatStatus) => {
    if (selectedSeatIds.includes(seat._id)) return SEAT_STATUS_COLOR.MYHOLD;
    if (!seat.status || seat.bookingStatus === "BOOKED") {
      return SEAT_STATUS_COLOR.BOOKED;
    }
    if (seat.bookingStatus === "HOLD") return SEAT_STATUS_COLOR.HOLD;
    return AVAILABLE_SEAT_COLOR;
  };

  const room = seatsQuery.data?.room || checkoutRoom;
  const columnCount = Math.max(room?.cols || 1, 1);
  const seatTypeLegends = [
    {
      label: "Ghế thường",
      color: AVAILABLE_SEAT_COLOR,
      type: "NORMAL",
      showPrice: true,
    },
    {
      label: "Ghế VIP",
      color: AVAILABLE_SEAT_COLOR,
      type: "VIP",
      showPrice: true,
    },
    {
      label: "Ghế đôi",
      color: AVAILABLE_SEAT_COLOR,
      type: "COUPLE",
      showPrice: true,
    },
  ];
  const seatStatusLegends = [
    {
      label: "Ghế trống",
      color: AVAILABLE_SEAT_COLOR,
      type: "NORMAL",
    },
    {
      label: "Đang được giữ",
      color: SEAT_STATUS_COLOR.HOLD,
      type: "NORMAL",
    },
    {
      label: "Đã chọn",
      color: SEAT_STATUS_COLOR.MYHOLD,
      type: "NORMAL",
    },
    {
      label: "Đã bán",
      color: SEAT_STATUS_COLOR.BOOKED,
      type: "NORMAL",
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-10 lg:pb-16">
      <div className="overflow-hidden border border-white/10 bg-[#101010]">
        <div className="border-b border-white/10 p-4 sm:p-6 lg:flex lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
              Seat Map
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              Sơ đồ ghế{room?.name ? ` · ${room.name}` : ""}
            </h3>
            {showtime && (
              <p className="mt-2 text-xs text-[#9A9A9A]">
                Suất chiếu{" "}
                {new Date(showtime.startTime).toLocaleString("vi-VN")}
              </p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#9A9A9A] lg:mt-0 lg:justify-end">
            <span>Tối đa {MAX_SELECTED_SEATS} ghế</span>
            <span>Không để trống một ghế đơn</span>
          </div>
        </div>

        {!showtimeId ? (
          <div className="m-4 border border-white/10 bg-[#141414] px-5 py-10 text-center text-sm text-[#9A9A9A] sm:m-6">
            Chọn một suất chiếu để xem sơ đồ ghế.
          </div>
        ) : seatsQuery.isLoading ? (
          <div className="m-4 border border-white/10 bg-[#141414] px-5 py-10 text-center text-sm text-[#9A9A9A] sm:m-6">
            Đang tải sơ đồ ghế...
          </div>
        ) : seatsQuery.isError ? (
          <div className="m-4 border border-[#DC0000]/30 bg-[#141414] px-5 py-10 text-center text-sm text-[#DC0000] sm:m-6">
            Không thể tải sơ đồ ghế của suất chiếu này.
          </div>
        ) : !allSeats.length ? (
          <div className="m-4 border border-white/10 bg-[#141414] px-5 py-10 text-center text-sm text-[#9A9A9A] sm:m-6">
            Phòng chiếu chưa có dữ liệu ghế.
          </div>
        ) : (
          <>
            <div className="grid border-b border-white/10 bg-[#141414] lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)]">
              <section className="border-b border-white/10 p-3 sm:p-4 lg:border-b-0 lg:border-r">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#777]">
                  Loại ghế
                </p>
                <div className="grid [grid-template-columns:repeat(auto-fit,minmax(88px,1fr))] gap-x-2 gap-y-3 sm:[grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
                  {seatTypeLegends.map((item) => {
                    const price = priceByType[item.type];
                    return (
                      <div
                        key={item.label}
                        className="flex min-w-0 flex-col items-center gap-2 text-center text-[10px] text-[#B8B8B8] sm:text-xs"
                      >
                        <span className="flex h-8 w-12 shrink-0 items-center justify-center">
                          <SeatIcon
                            compact
                            type={item.type as ISeatStatus["type"]}
                            color={item.color}
                            darkText
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block">{item.label}</span>
                          {price != null && (
                            <strong className="block text-[#F2F2F2]">
                              {formatCurrency(Number(price))}
                            </strong>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="p-3 sm:p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#777]">
                  Trạng thái ghế
                </p>
                <div className="grid [grid-template-columns:repeat(auto-fit,minmax(116px,1fr))] gap-x-3 gap-y-2">
                  {seatStatusLegends.map((item) => (
                    <div
                      key={item.label}
                      className="flex min-w-0 items-center gap-2 text-[10px] leading-tight text-[#B8B8B8] sm:text-xs"
                    >
                      <span className="flex h-8 w-10 shrink-0 items-center justify-center">
                        <SeatIcon
                          compact
                          type={item.type as ISeatStatus["type"]}
                          color={item.color}
                          darkText
                        />
                      </span>
                      <span className="min-w-0">{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="overflow-x-auto px-3 pb-6 pt-8 sm:px-6 sm:pb-8 sm:pt-10">
              <div
                className="mx-auto"
                style={{
                  minWidth: `${Math.max(360, columnCount * 34 + 28)}px`,
                  maxWidth: `${Math.max(560, columnCount * 50 + 36)}px`,
                }}
              >
                <div className="relative mx-auto mb-10 h-12 w-[92%]">
                  <div className="absolute inset-x-0 top-0 h-8 rounded-[50%] border-t-4 border-[#B8B8B8] shadow-[0_-7px_22px_rgba(242,242,242,0.3)]" />
                  <p className="absolute inset-x-0 bottom-0 text-center text-[9px] font-black uppercase tracking-[0.28em] text-[#9A9A9A]">
                    Màn hình chiếu
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-2.5">
                  {displayLayout.map((row) => (
                    <div
                      key={row[0]?._id}
                      className="grid items-center gap-1.5 sm:gap-2"
                      style={{
                        gridTemplateColumns: `20px repeat(${columnCount}, minmax(26px, 1fr))`,
                      }}
                    >
                      <span className="text-center text-[10px] font-black text-[#777] sm:text-xs">
                        {row[0]?.label.charAt(0)}
                      </span>
                      {row.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat._id);
                        const isBlocked =
                          !seat.status ||
                          (seat.bookingStatus !== "AVAILABLE" &&
                            !(
                              seat.bookingStatus === "HOLD" &&
                              seat.userId === user?._id
                            ));
                        const seatColor = getSeatColor(seat);
                        const useDarkText = [
                          AVAILABLE_SEAT_COLOR,
                          SEAT_STATUS_COLOR.HOLD,
                        ].includes(seatColor);
                        const remaining =
                          seat.bookingStatus === "HOLD"
                            ? seatHoldRemaining(
                                seat.countdownUntil || seat.heldUntil,
                                seatClockNow,
                              )
                            : null;
                        return (
                          <button
                            key={seat._id}
                            type="button"
                            disabled={isBlocked}
                            aria-pressed={isSelected}
                            aria-label={`Ghế ${seat.label}, ${seat.type}, ${seat.bookingStatus}`}
                            onClick={() => toggleSeat(seat)}
                            className={`relative flex min-h-8 min-w-6 items-center justify-center text-[8px] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2F2F2] disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-10 sm:min-w-8 sm:text-[10px] lg:min-h-11 lg:text-xs ${
                              seatColor === AVAILABLE_SEAT_COLOR
                                ? "hover:brightness-[1.65]"
                                : "hover:brightness-110"
                            }`}
                            style={{
                              gridColumn: `${seat.col + 1} / span ${seat.span || 1}`,
                            }}
                          >
                            <SeatIcon
                              type={seat.type}
                              color={seatColor}
                              label={seat.label}
                              darkText={useDarkText}
                            />
                            {remaining !== null && (
                              <span className="absolute -bottom-1 left-1/2 z-10 min-w-max -translate-x-1/2 rounded bg-black/90 px-1 py-0.5 text-[7px] font-bold leading-none text-white shadow sm:text-[8px]">
                                <span className="font-mono">
                                  {remaining > 0
                                    ? formatCountdown(remaining)
                                    : formatCountdown(remaining)}
                                </span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {showtime && (
              <div className="border-t border-white/10 px-4 pt-5 sm:px-6">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9A9A9A]">
                  Suất đang chọn
                </p>

                <div className="mt-3 grid gap-3 border border-white/10 bg-[#0A0A0A] p-4 text-sm text-[#B8B8B8] sm:grid-cols-2">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-[#666]">
                      Định dạng
                    </span>

                    <span className="mt-1 inline-flex border border-[#DC0000]/50 bg-[#DC0000]/15 px-3 py-1 text-xs font-black uppercase text-[#F2F2F2]">
                      {showtime.projectionFormat}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-[#666]">
                      Bảng giá suất này
                    </span>

                    <div className="mt-1 flex flex-wrap gap-2">
                      {selectedShowtimePrices.map((price) => (
                        <span
                          key={price.seatType}
                          className="border border-white/10 px-2 py-1 text-xs font-bold text-[#F2F2F2]"
                        >
                          {price.seatType}: {formatCurrency(price.value)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-white/10 p-4 pt-5 sm:p-6 sm:pt-5">
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
              {selectedSeatIds.length > 0 && holdDeadline && (
                <div
                  className={`mt-3 inline-flex items-center gap-2 border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${
                    holdRemainingSeconds <= 60
                      ? "border-[#DC0000]/60 bg-[#DC0000]/10 text-[#DC0000]"
                      : "border-white/10 bg-[#0A0A0A] text-[#F2F2F2]"
                  }`}
                  role="timer"
                  aria-live="polite"
                >
                  <span>Thời gian giữ ghế</span>
                  <span className="font-mono text-sm">
                    {formatCountdown(holdRemainingSeconds)}
                  </span>
                </div>
              )}
              {notice && (
                <p className="mt-2 text-xs text-[#DC0000]" role="status">
                  {notice}
                </p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedSeatIds.length}
                  onClick={() => {
                    if (!isAuthenticated) {
                      requestLogin({
                        action: () => setIsCheckoutOpen(true),
                      });
                      return;
                    }
                    setIsCheckoutOpen(true);
                  }}
                  className="min-h-11 bg-[#DC0000] px-6 text-xs font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition hover:bg-[#F2F2F2] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/80 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
          <button
            type="button"
            aria-label="Đóng thanh toán"
            className="absolute inset-0"
            onClick={() => setIsCheckoutOpen(false)}
          />

          <div className="relative max-h-[92vh] w-full overflow-y-auto border border-white/10 bg-[#101010] shadow-2xl shadow-black/70 sm:max-w-5xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#101010]/95 p-4 backdrop-blur sm:p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#DC0000]">
                  Checkout
                </p>
                <h4 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
                  Hoàn tất đặt vé
                </h4>
                <p className="mt-1 text-xs text-[#9A9A9A] sm:text-sm">
                  Ghế {selectedSeats.map((seat) => seat.label).join(", ")} ·{" "}
                  {formatCurrency(totalPrice)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="h-10 shrink-0 border border-white/10 px-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#F2F2F2] transition hover:border-[#DC0000] hover:text-[#DC0000] sm:px-4 sm:text-xs"
              >
                Đóng
              </button>
            </div>

            <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                <section className="border border-white/10 bg-[#0A0A0A] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9A9A9A]">
                        Bắp nước / Combo
                      </p>
                      <p className="mt-1 text-sm text-[#B8B8B8]">
                        Có thể bỏ qua nếu bạn chỉ muốn mua vé.
                      </p>
                    </div>
                    <span className="border border-[#DC0000]/40 bg-[#DC0000]/10 px-3 py-1 text-[10px] font-black uppercase text-[#F2F2F2]">
                      Không bắt buộc
                    </span>
                  </div>

                  {productsQuery.isLoading ? (
                    <p className="mt-4 text-sm text-[#9A9A9A]">
                      Đang tải danh sách bắp nước...
                    </p>
                  ) : productsQuery.isError ? (
                    <p className="mt-4 text-sm text-[#DC0000]">
                      Không thể tải danh sách bắp nước.
                    </p>
                  ) : (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {(productsQuery.data || []).flatMap((product) =>
                        product.variants
                          .filter((variant) => variant.is_active)
                          .map((variant) => {
                            const variantId = String(variant.id);
                            const quantity = productQuantities[variantId] || 0;

                            return (
                              <div
                                key={variantId}
                                className={`flex items-center justify-between gap-3 border p-3 transition sm:p-4 ${
                                  quantity
                                    ? "border-[#DC0000]/60 bg-[#DC0000]/10"
                                    : "border-white/10 bg-[#141414]"
                                }`}
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-black text-[#F2F2F2]">
                                    {product.name} · {variant.name}
                                  </p>
                                  <p className="mt-1 text-xs text-[#9A9A9A]">
                                    {formatCurrency(Number(variant.price || 0))}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <button
                                    type="button"
                                    aria-label={`Giảm ${product.name} ${variant.name}`}
                                    className="h-8 w-8 border border-white/10 text-sm transition hover:border-[#DC0000]"
                                    onClick={() =>
                                      setProductQuantities((current) => ({
                                        ...current,
                                        [variantId]: Math.max(0, quantity - 1),
                                      }))
                                    }
                                  >
                                    −
                                  </button>
                                  <span className="w-5 text-center text-sm font-black">
                                    {quantity}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label={`Tăng ${product.name} ${variant.name}`}
                                    className="h-8 w-8 border border-white/10 text-sm transition hover:border-[#DC0000]"
                                    onClick={() =>
                                      setProductQuantities((current) => ({
                                        ...current,
                                        [variantId]: Math.min(20, quantity + 1),
                                      }))
                                    }
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          }),
                      )}
                    </div>
                  )}
                </section>

                <section className="border border-white/10 bg-[#0A0A0A] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9A9A9A]">
                    Voucher
                  </p>
                  <input
                    value={voucherCode}
                    onChange={(event) =>
                      setVoucherCode(event.target.value.toUpperCase())
                    }
                    placeholder="Nhập mã voucher"
                    className="mt-3 min-h-12 w-full border border-white/10 bg-[#141414] px-4 text-sm uppercase text-white outline-none transition placeholder:normal-case focus:border-[#DC0000]"
                  />
                  {promotionPreview.isFetching && (
                    <p className="mt-2 text-xs text-[#9A9A9A]">
                      Đang kiểm tra khuyến mại...
                    </p>
                  )}
                  {promotionPreview.isError && voucherCode.trim() && (
                    <p className="mt-2 text-xs text-[#DC0000]">
                      Voucher không hợp lệ hoặc chưa đủ điều kiện.
                    </p>
                  )}
                  {promotionPreview.data?.applied_promotions.map(
                    (promotion) => (
                      <p
                        key={promotion.promotion_id}
                        className="mt-2 text-xs font-bold text-green-400"
                      >
                        Đã áp dụng: {promotion.name}
                      </p>
                    ),
                  )}
                </section>
              </div>

              <aside className="h-max border border-white/10 bg-[#0A0A0A] p-4 lg:sticky lg:top-24">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9A9A9A]">
                  Tóm tắt đơn hàng
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4 text-[#B8B8B8]">
                    <span>Tiền vé</span>
                    <span>
                      {formatCurrency(
                        promotionPreview.data?.seat_amount ?? totalPrice,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-[#B8B8B8]">
                    <span>Bắp nước/combo</span>
                    <span>
                      {formatCurrency(
                        promotionPreview.data?.product_amount ??
                          localProductAmount,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-[#B8B8B8]">
                    <span>Giảm giá</span>
                    <span>
                      -
                      {formatCurrency(
                        promotionPreview.data?.discount_amount ?? 0,
                      )}
                    </span>
                  </div>

                  {promotionPreview.data?.applied_promotions.length ? (
                    <div className="border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-300">
                      <p className="font-black uppercase tracking-[0.12em]">
                        Khuyến mại đã áp dụng (
                        {promotionPreview.data.applied_promotions.length})
                      </p>
                      <div className="mt-2 divide-y divide-green-500/15">
                        {promotionPreview.data.applied_promotions.map(
                          (promotion, index) => (
                            <div
                              key={`${promotion.promotion_id}-${promotion.code || index}`}
                              className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0"
                            >
                              <span className="min-w-0">
                                <strong className="block text-[#F2F2F2]">
                                  {promotion.name}
                                </strong>
                                {promotion.code && (
                                  <span className="mt-0.5 block font-black uppercase tracking-[0.08em]">
                                    Mã: {promotion.code}
                                  </span>
                                )}
                              </span>
                              <span className="shrink-0 font-black">
                                {Number(promotion.discount_amount || 0) > 0
                                  ? `-${formatCurrency(
                                      Number(promotion.discount_amount),
                                    )}`
                                  : promotion.gift_items?.length
                                    ? "Quà tặng"
                                    : "Đã áp dụng"}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}

                  {promotionPreview.data?.gift_items.length ? (
                    <div className="border border-[#DC0000]/40 bg-[#DC0000]/10 p-3 text-xs text-[#F2F2F2]">
                      <p className="font-black uppercase tracking-[0.12em] text-[#DC0000]">
                        Quà tặng nhận tại quầy
                      </p>
                      <div className="mt-2 space-y-1">
                        {promotionPreview.data.gift_items.map((gift, index) => (
                          <div
                            key={`${gift.product_variant_id || index}-${gift.product_name}`}
                            className="flex justify-between gap-3"
                          >
                            <span>
                              {gift.product_name} · {gift.variant_name}
                            </span>
                            <span>x{Number(gift.quantity || 1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-black text-white">
                    <span>Tổng thanh toán</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    !selectedSeatIds.length ||
                    checkout.isPending ||
                    promotionPreview.isFetching
                  }
                  onClick={() => checkout.mutate()}
                  className="mt-5 min-h-12 w-full bg-[#DC0000] px-6 text-xs font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition hover:bg-[#F2F2F2] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {checkout.isPending
                    ? "Đang tạo thanh toán..."
                    : "Thanh toán qua VNPAY"}
                </button>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideSeat;
