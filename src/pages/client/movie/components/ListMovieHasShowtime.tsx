import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link } from "react-router";
import { QUERYKEY } from "../../../../common/constants/queryKey";
import { getMovieShowtimes } from "../../../../common/services/showtime.service";
import { getAgeBadge } from "../../../../common/utils/agePolicy";
import type { IRoom } from "../../../../common/types/room";
import type { IShowtime } from "../../../../common/types/showtime";
import ModalSelectRoom from "../detail/components/ModalSelectRoom";
import type { ICategory } from "../../../../common/types/category";
import { useCheckoutSelector } from "../../../../common/stores/useCheckoutStore";

const ListMovieHasShowtime = ({
  startTimeFrom,
  startTimeTo,
}: {
  startTimeFrom: string;
  startTimeTo: string;
}) => {
  const { data } = useQuery({
    queryKey: [QUERYKEY.SHOWTIME, startTimeFrom, startTimeTo],
    queryFn: () =>
      getMovieShowtimes({
        status: "scheduled",
        sort: "startTime",
        order: "asc",
        startTimeFrom,
        startTimeTo,
      }),
    enabled: !!startTimeFrom,
  });
  const setInformation = useCheckoutSelector((state) => state.setInformation);
  return (
    <div
      className="grid mt-8 gap-8"
      style={{ gridTemplateColumns: `repeat(2, 1fr)` }}
    >
      {data?.data.map((item) => {
        const { label, description } = getAgeBadge(item.ageRequire);
        return (
          <div className="border-gray-500/50 flex rounded-lg overflow-hidden border">
            <img src={item.poster} className="w-54 h-78" alt="" />
            <div className="p-8">
              <Link
                to={`/movie/${item._id}`}
                className="flex flex-col gap-1 text-white! group"
              >
                <div className="text-gray-300/50">
                  <p>{item.duration} phút</p>
                  <p>
                    {(item.category as ICategory[])
                      .map((category) => category.name)
                      .join(", ")}
                  </p>
                </div>
                <p className="uppercase font-bold text-lg group-hover:text-primary transition line-clamp-1 ">
                  {item.name}
                </p>
                <p>Xuất xứ: {item.country}</p>
                <p>
                  Khởi chiếu: {dayjs(item.releaseDate).format("DD/MM/YYYY")}
                </p>
                <p className="text-primary line-clamp-2" title={description}>
                  {label} - {description}
                </p>
              </Link>
              <p className="font-bold mt-2">Lịch chiếu</p>
              <div
                className="grid mt-2 flex-wrap gap-2"
                style={{ gridTemplateColumns: "repeat(5, 1fr)" }}
              >
                {item.showtimes.map((stItem) =>
                  stItem && (stItem.externalRoom as IRoom[]).length > 1 ? (
                    <ModalSelectRoom
                      movieId={item._id}
                      room={stItem.externalRoom as IRoom[]}
                      showtime={stItem as IShowtime}
                    >
                      <button className="border text-white! border-white px-2 py-1 text-base rounded-md transition hover:bg-gray-500/50 cursor-pointer">
                        {dayjs(stItem.startTime).format("HH:mm")}
                      </button>
                    </ModalSelectRoom>
                  ) : (
                    <Link
                      to={`/movie/${item._id}/${stItem._id}/${stItem.roomId._id}`}
                      onClick={() =>
                        setInformation({
                          showtime: { ...stItem, movieId: item },
                          room: stItem.roomId,
                        })
                      }
                    >
                      <button className="border text-white! border-white px-2 py-1 text-base rounded-md transition hover:bg-gray-500/50 cursor-pointer">
                        {dayjs(stItem.startTime).format("HH:mm")}
                      </button>
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ListMovieHasShowtime;
