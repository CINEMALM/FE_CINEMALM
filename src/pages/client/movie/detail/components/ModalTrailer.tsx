import { Button, Modal } from "antd";
import React, { useState, type ReactElement } from "react";
import type { IMovie } from "../../../../../common/types/movie";

const ModalTrailer = ({
  children,
  movie,
}: {
  children: ReactElement;
  movie?: IMovie;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          setOpen(true);
        },
      } as { onClick: () => void })}
      <Modal
        onCancel={() => setOpen(false)}
        open={open}
        destroyOnHidden
        width={1000}
        title={
          <p className="line-clamp-1 font-display text-xl font-bold text-[#F2F2F2]">
            Trailer phim {movie?.name}
          </p>
        }
        footer={
          <Button type="primary" onClick={() => setOpen(false)}>
            Đóng
          </Button>
        }
      >
        <div className="aspect-video w-full overflow-hidden bg-black">
          <iframe
            width="100%"
            height="100%"
            src={movie?.trailer}
            title={`Trailer phim ${movie?.name || ""}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </Modal>
    </>
  );
};

export default ModalTrailer;
