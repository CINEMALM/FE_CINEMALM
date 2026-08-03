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
        title={
          <p className="line-clamp-1 font-display text-xl font-bold text-[#F2F2F2]">
            Nội dung phim {movieName}
          </p>
        }
        footer={
          <Button type="primary" onClick={() => setOpen(false)}>
            Đóng
          </Button>
        }
      >
        <p className="py-2 text-sm leading-7 text-[#B8B8B8]">
          {description || "Nội dung phim đang được cập nhật."}
        </p>
      </Modal>
    </>
  );
};

export default ModalDescription;
