import { Button, Modal } from "antd";
import React, { useMemo, useState, type ReactElement } from "react";
import type { IMovie } from "../../../../../common/types/movie";

const getYoutubeEmbedUrl = (trailer?: string) => {
  if (!trailer) return null;

  try {
    const url = new URL(trailer.trim());
    const hostname = url.hostname.replace(/^www\./, "");
    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") || "";
      } else {
        const [, type, id] = url.pathname.split("/");
        if (["embed", "shorts", "live"].includes(type)) {
          videoId = id || "";
        }
      }
    }

    if (!/^[\w-]{11}$/.test(videoId)) return null;

    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
  } catch {
    return null;
  }
};

const ModalTrailer = ({
  children,
  movie,
}: {
  children: ReactElement;
  movie?: IMovie;
}) => {
  const [open, setOpen] = useState(false);
  const trailerUrl = useMemo(
    () => getYoutubeEmbedUrl(movie?.trailer),
    [movie?.trailer],
  );

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
        {trailerUrl ? (
          <div className="aspect-video w-full overflow-hidden bg-black">
            <iframe
              width="100%"
              height="100%"
              src={trailerUrl}
              title={`Trailer phim ${movie?.name || ""}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-black px-6 text-center text-[#9A9A9A]">
            Link trailer không hợp lệ hoặc chưa được YouTube hỗ trợ.
          </div>
        )}
      </Modal>
    </>
  );
};

export default ModalTrailer;
