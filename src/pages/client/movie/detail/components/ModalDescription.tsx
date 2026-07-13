import { Button, Modal } from "antd";
import React, { useState, type ReactElement } from "react";

const ModalDescription = ({
  children,
  description,
  movieName,
}: {
  children: ReactElement;
  description?: string;
  movieName?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
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
        width={800}
        className="rounded-xl border border-white/10  backdrop-blur-md"
        style={{
          background: `hsl(222.2 84% 4.9%)`,
        }}
        title={
          <p className="text-lg font-semibold text-white/90 tracking-wide line-clamp-1">
            Trailer phim {movieName}
          </p>
        }
        footer={<Button onClick={() => setOpen(false)}>Đóng</Button>}
      >
        <p>{description}</p>
      </Modal>
    </>
  );
};

export default ModalDescription;
