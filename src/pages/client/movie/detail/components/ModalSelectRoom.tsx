import { Modal } from "antd";
import dayjs from "dayjs";
import React, { useState, type ReactElement } from "react";
import { useParams } from "react-router";
import { useAuthNavigate } from "../../../../../common/hooks/useAuthNavigate";
import { useCheckoutSelector } from "../../../../../common/stores/useCheckoutStore";
import type { IRoom } from "../../../../../common/types/room";
import type { IShowtime } from "../../../../../common/types/showtime";

const ModalSelectRoom = ({
  children,
  room,
  showtime,
  movieId,
  onSelect,
}: {
  children: ReactElement;
  room: IRoom[];
  showtime: IShowtime;
  movieId?: string;
  onSelect?: (showtime: IShowtime, room: IRoom) => void;
}) => {
  const [open, setOpen] = useState(false);
  const setInformation = useCheckoutSelector((state) => state.setInformation);
  const { id } = useParams();
  const nav = useAuthNavigate();
  return (
    <>
      {React.cloneElement(children, {
        onClick: () => setOpen(true),
      } as { onClick: () => void })}
      <Modal
        onCancel={() => setOpen(false)}
        open={open}
        width={600}
        title={
          <p className="font-display text-xl font-bold text-[#F2F2F2]">
            Lựa chọn phòng chiếu
          </p>
        }
        footer={null}
      >
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {room.map((item) => (
            <button
              key={item._id}
              onClick={() => {
                const selectedShowtime = {
                  ...showtime,
                  _id: item.showtimeId || showtime._id,
                  roomId: item,
                  price: item.showtimePrice || showtime.price,
                };
                setOpen(false);
                nav(
                  `/movie/${movieId ? movieId : id}/${selectedShowtime._id}/${item._id}?hour=${dayjs(showtime.startTime).format("HH:mm")}&movieId=${showtime.movieId._id}`,
                );
                setInformation({ showtime: selectedShowtime, room: item });
                onSelect?.(selectedShowtime, item);
              }}
              className="min-h-11 w-full border border-white/10 px-3 text-sm font-bold text-[#F2F2F2] transition hover:border-[#DC0000] hover:bg-[#DC0000] hover:text-[#0A0A0A]"
            >
              {item.name}
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default ModalSelectRoom;
