import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { Button, Image, Upload } from "antd";
import { useEffect, useState } from "react";

interface UploadImageProps {
  width?: number;
  height?: number;
  value?: string | UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
}

export default function UploadImage({
  width = 200,
  height = 300,
  value,
  onChange,
}: UploadImageProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (typeof value === "string") {
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: value,
        },
      ]);
    } else if (Array.isArray(value)) {
      setFileList(value);
    } else {
      setFileList([]);
    }
  }, [value]);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    onChange?.(newFileList);
  };

  const handleRemove = () => {
    setFileList([]);
    onChange?.([]);
  };

  return (
    <Upload
      listType="picture-card"
      maxCount={1}
      beforeUpload={() => false}
      fileList={fileList}
      onChange={handleChange}
      showUploadList={false}
      style={{ width, height }}
    >
      {fileList.length >= 1 ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 8,
            overflow: "hidden",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Image
            src={
              fileList[0].url || URL.createObjectURL(fileList[0].originFileObj!)
            }
            alt="uploaded"
            width="100%"
            height="100%"
            style={{
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              zIndex: 10,
            }}
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
            />
          </div>
        </div>
      ) : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>Tải lên</div>
        </div>
      )}
    </Upload>
  );
}
