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
        className="rounded-xl border border-white/10 backdrop-blur-md"
        style={{
          background: `hsl(222.2 84% 4.9%)`,
        }}
        title={
          <p className="text-lg font-semibold text-white/90 tracking-wide line-clamp-1">
            Trailer phim {movie?.name}
          </p>
        }
        footer={<Button onClick={() => setOpen(false)}>Đóng</Button>}
      >
        <div className="min-h-[360px]">
          <iframe
            width="950"
            height="560"
            src={movie?.trailer}
            title="YouTube video player"
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
