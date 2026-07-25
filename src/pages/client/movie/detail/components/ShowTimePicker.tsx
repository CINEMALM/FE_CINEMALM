import {
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { DAYOFWEEK_LABEL } from "../../../../../common/constants/dayOfWeek";
import { QUERYKEY } from "../../../../../common/constants/queryKey";
import { getShowtimeWeekday } from "../../../../../common/services/showtime.service";
import { useCheckoutSelector } from "../../../../../common/stores/useCheckoutStore";
import type { IRoom } from "../../../../../common/types/room";
import type { IShowtime } from "../../../../../common/types/showtime";
import GuideSeat from "./GuideSeat";
import ModalSelectRoom from "./ModalSelectRoom";

const PAGE_SIZE = 7;
const showtimeButtonClass = (isSelected: boolean) =>
  `inline-flex min-h-10 min-w-20 items-center justify-center border px-3 text-sm font-bold transition ${
    isSelected
      ? "border-[#DC0000] bg-[#DC0000] text-[#0A0A0A]"
      : "border-white/10 hover:border-[#DC0000] hover:bg-[#DC0000] hover:text-[#0A0A0A]"
  }`;

const ShowtimePicker = () => {
  const navigate = useNavigate();
  const { id, showtimeId, roomId } = useParams();
  const [page, setPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectionByDate, setSelectionByDate] = useState<
    Record<string, { showtime: IShowtime; room: IRoom }>
  >({});
  const setInformation = useCheckoutSelector((state) => state.setInformation);

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERYKEY.SHOWTIME, id, page],
    queryFn: () =>
      getShowtimeWeekday({
        status: "scheduled",
        movieId: id,
        sort: "startTime",
        order: "asc",
        limit: PAGE_SIZE,
        page,
        groupTime: true,
        startTimeFrom: dayjs()
          .add(1, "hour")
          .second(0)
          .millisecond(0)
          .toISOString(),
      }),
    enabled: Boolean(id),
  });

  const groupedShowtimes = data?.data;
  const dates = groupedShowtimes ? Object.keys(groupedShowtimes) : [];
  const showtimes = selectedDate ? groupedShowtimes?.[selectedDate] || [] : [];
  const selectedShowtimeForDate = selectedDate
    ? selectionByDate[selectedDate]?.showtime
    : undefined;

  useEffect(() => {
    if (!dates.length) {
      setSelectedDate(undefined);
      return;
    }

    const dateOfSelectedShowtime = showtimeId
      ? dates.find((date) =>
          groupedShowtimes?.[date].some(
            (showtime) =>
              showtime._id === showtimeId ||
              showtime.externalRoom?.some(
                (room) => room.showtimeId === showtimeId,
              ),
          ),
        )
      : undefined;

    setSelectedDate(
      (current) =>
        (current && dates.includes(current) ? current : undefined) ||
        dateOfSelectedShowtime ||
        dates[0],
    );
  }, [dates.join("|"), groupedShowtimes, showtimeId]);

  const selectShowtime = useCallback(
    (showtime: IShowtime, room: IRoom) => {
      const date = dayjs(showtime.startTime).format("YYYY-MM-DD");
      setSelectionByDate((current) => {
        const selected = current[date];
        if (
          selected?.showtime._id === showtime._id &&
          selected.room._id === room._id
        ) {
          return current;
        }
        return { ...current, [date]: { showtime, room } };
      });
      setInformation({ showtime, room, seat: [], totalPrice: 0 });
      if (showtimeId !== showtime._id || roomId !== room._id) {
        navigate(
          `/movie/${id}/${showtime._id}/${room._id}?hour=${dayjs(
            showtime.startTime,
          ).format("HH:mm")}&movieId=${id}`,
        );
      }
    },
    [id, navigate, roomId, setInformation, showtimeId],
  );

  useEffect(() => {
    if (!selectedDate || !showtimes.length) return;

    const remembered = selectionByDate[selectedDate];
    if (remembered) return;

    const routeShowtime = showtimeId
      ? showtimes.find(
          (item) =>
            item._id === showtimeId ||
            item.externalRoom?.some((room) => room.showtimeId === showtimeId),
        )
      : undefined;
    const routeRoom = routeShowtime
      ? [routeShowtime.roomId, ...(routeShowtime.externalRoom || [])].find(
          (room) =>
            room._id === roomId &&
            (room.showtimeId || routeShowtime._id) === showtimeId,
        )
      : undefined;

    if (routeShowtime && routeRoom) {
      const actualShowtime = {
        ...routeShowtime,
        _id: routeRoom.showtimeId || routeShowtime._id,
        roomId: routeRoom,
        price: routeRoom.showtimePrice || routeShowtime.price,
      };
      selectShowtime(actualShowtime, routeRoom);
      return;
    }

    selectShowtime(showtimes[0], showtimes[0].roomId);
  }, [
    roomId,
    selectedDate,
    selectionByDate,
    selectShowtime,
    showtimeId,
    showtimes,
  ]);

  const handleSelectShowtime = (showtime: IShowtime, room: IRoom) => {
    selectShowtime(showtime, room);
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
  };

  const changeWeek = (nextPage: number) => {
    setPage(nextPage);
    setSelectedDate(undefined);
  };

  return (
    <section className="border-b border-white/10 bg-[#0A0A0A]">
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#DC0000]">
            Book Tickets
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Chọn lịch chiếu
          </h2>
        </div>

        {isLoading ? (
          <div className="mt-8 border border-white/10 bg-[#141414] px-5 py-12 text-center text-sm text-[#9A9A9A]">
            Đang tải lịch chiếu...
          </div>
        ) : (
          <>
            {isError && (
              <div className="mt-7 flex items-center gap-3 border border-[#DC0000]/25 bg-[#141414] px-4 py-3 text-xs text-[#9A9A9A]">
                <CalendarOutlined className="shrink-0 text-[#DC0000]" />
                Không thể tải lịch chiếu. Vui lòng thử lại sau.
              </div>
            )}
            {!isError && !dates.length && (
              <div className="mt-7 flex items-center gap-3 border border-white/10 bg-[#141414] px-4 py-3 text-xs text-[#9A9A9A]">
                <CalendarOutlined className="shrink-0 text-[#DC0000]" />
                Chưa có lịch chiếu trong khoảng thời gian này.
              </div>
            )}
            <div className="mt-7 flex items-stretch gap-2">
              <button
                type="button"
                aria-label="Xem tuần trước"
                disabled={page <= 1}
                onClick={() => changeWeek(Math.max(1, page - 1))}
                className="min-w-11 border border-white/10 bg-[#141414] text-[#F2F2F2] transition hover:border-[#DC0000] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <LeftOutlined />
              </button>

              <div className="flex flex-1 snap-x gap-2 overflow-x-auto pb-1">
                {dates.map((date) => {
                  const isActive = date === selectedDate;
                  return (
                    <button
                      key={date}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => selectDate(date)}
                      className={`min-h-20 min-w-[92px] snap-start border px-3 py-2 text-center transition sm:min-w-[108px] ${
                        isActive
                          ? "border-[#DC0000] bg-[#DC0000] text-[#0A0A0A]"
                          : "border-white/10 bg-[#141414] text-[#9A9A9A] hover:border-white/30 hover:text-[#F2F2F2]"
                      }`}
                    >
                      <span className="block text-[10px] font-black uppercase tracking-[0.12em]">
                        {DAYOFWEEK_LABEL[dayjs(date).day()]}
                      </span>
                      <span className="mt-1 block text-xl font-bold">
                        {dayjs(date).format("DD/MM")}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                aria-label="Xem tuần tiếp theo"
                disabled={isError}
                onClick={() => changeWeek(page + 1)}
                className="min-w-11 border border-white/10 bg-[#141414] text-[#F2F2F2] transition hover:border-[#DC0000] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <RightOutlined />
              </button>
            </div>

            <div className="mt-7 border border-white/10 bg-[#141414] p-4 sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9A9A9A]">
                Suất chiếu ngày{" "}
                {selectedDate && dayjs(selectedDate).format("DD/MM/YYYY")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {showtimes.map((showtime) => {
                  const isSelected = Boolean(
                    showtime._id === selectedShowtimeForDate?._id ||
                      showtime.externalRoom?.some(
                        (room) =>
                          room.showtimeId === selectedShowtimeForDate?._id,
                      ),
                  );

                  return (showtime.externalRoom?.length || 0) > 1 ? (
                    <ModalSelectRoom
                      key={showtime._id}
                      showtime={showtime}
                      room={showtime.externalRoom as IRoom[]}
                      onSelect={handleSelectShowtime}
                    >
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        className={showtimeButtonClass(isSelected)}
                      >
                        {dayjs(showtime.startTime).format("HH:mm")}
                      </button>
                    </ModalSelectRoom>
                  ) : (
                    <button
                      key={showtime._id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        handleSelectShowtime(showtime, showtime.roomId as IRoom)
                      }
                      className={showtimeButtonClass(isSelected)}
                    >
                      {dayjs(showtime.startTime).format("HH:mm")}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      {!isLoading && !isError && <GuideSeat />}
    </section>
  );
};

export default ShowtimePicker;
