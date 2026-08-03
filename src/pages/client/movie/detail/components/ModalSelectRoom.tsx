import { Modal } from "antd";
import dayjs from "dayjs";
import React, { useState, type ReactElement } from "react";
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
  const navigateWithAuth = useAuthNavigate();
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
                  projectionFormat:
                    item.showtimeProjectionFormat || showtime.projectionFormat,
                };
                setOpen(false);
                if (onSelect) {
                  onSelect(selectedShowtime, item);
                } else {
                  setInformation({
                    showtime: selectedShowtime,
                    room: item,
                    seat: [],
                    totalPrice: 0,
                  });
                  navigateWithAuth(
                    `/movie/${movieId || showtime.movieId._id}/${selectedShowtime._id}/${item._id}?hour=${dayjs(
                      showtime.startTime,
                    ).format("HH:mm")}&movieId=${showtime.movieId._id}`,
                  );
                }
              }}
              className="min-h-11 w-full border border-white/10 px-3 text-sm font-bold text-[#F2F2F2] transition hover:border-[#DC0000] hover:bg-[#DC0000] hover:text-[#0A0A0A]"
            >
              <span className="block">{item.name}</span>
              <span className="block text-[10px] font-black uppercase opacity-70">
                {item.showtimeProjectionFormat || showtime.projectionFormat}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default ModalSelectRoom;
