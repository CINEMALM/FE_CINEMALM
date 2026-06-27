import { Button, Form, Input, Modal } from "antd";
import type { ReactElement } from "react";
import React, { useState } from "react";
import { formRules } from "../common/utils/formRules";

const ForgotPasswordModal = ({
  children,
  onSwitch,
}: {
  children: ReactElement;
  onSwitch?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = (values: { email: string }) => {
    console.log(values);

    // TODO:
    // - Gọi API quên mật khẩu
    // - Hiển thị thông báo thành công/thất bại
    // - Đóng modal sau khi gửi yêu cầu thành công
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          if (onSwitch) onSwitch();
          setOpen(true);
        },
      } as { onClick: () => void })}

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        afterClose={() => form.resetFields()}
        width={600}
        footer={null}
        className="rounded-xl border border-white/10 backdrop-blur-md"
        style={{
          background: "hsl(222.2 84% 4.9%)",
        }}
        title={
          <p className="text-lg font-semibold text-white/90 tracking-wide">
            Quên mật khẩu
          </p>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="my-6!"
        >
          <Form.Item
            name="email"
            label={<p className="text-base font-medium">Email</p>}
            rules={[
              formRules.required("Email"),
              {
                type: "email",
                message: "Vui lòng nhập đúng định dạng email!",
              },
            ]}
          >
            <Input
              placeholder="Email"
              className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
              style={{
                height: 60,
                boxShadow: "none",
              }}
            />
          </Form.Item>

          <div className="pt-4!">
            <Form.Item>
              <Button
                htmlType="submit"
                style={{
                  background: "var(--color-primary)",
                  height: 45,
                  width: "100%",
                  borderRadius: "calc(infinity * 1px)",
                }}
              >
                Xác nhận
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ForgotPasswordModal;