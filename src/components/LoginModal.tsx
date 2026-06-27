import { Button, Form, Input, Modal } from "antd";
import type { ReactElement } from "react";
import React, { useState } from "react";
import RegisterModal from "./RegisterModal";

const LoginModal = ({
  children,
  onSwitch,
}: {
  children: ReactElement;
  onSwitch?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: {
    email: string;
    password: string;
  }) => {
    setLoading(true);

    try {
      console.log("Login values:", values);

      // TODO: Gọi API đăng nhập tại đây

      // TODO: Lưu thông tin người dùng sau khi đăng nhập

      // TODO: Điều hướng sau khi đăng nhập thành công

      setOpen(false);
    } catch (error) {
      // TODO: Hiển thị thông báo lỗi
      console.error(error);
    } finally {
      setLoading(false);
    }
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
        className="rounded-xl border border-white/10 backdrop-blur-md"
        style={{
          background: `hsl(222.2 84% 4.9%)`,
        }}
        footer={null}
        title={
          <p className="text-lg font-semibold text-white/90 tracking-wide">
            Đăng nhập
          </p>
        }
      >
        <Form
          form={form}
          layout="vertical"
          className="my-6!"
          onFinish={handleSubmit}
        >
          <Form.Item
            label={<p className="text-base font-medium">Email</p>}
            name="email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email!",
              },
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

          <Form.Item
            label={<p className="text-base font-medium">Mật khẩu</p>}
            name="password"
            hasFeedback
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input.Password
              placeholder="Mật khẩu"
              className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
              style={{
                height: 60,
                boxShadow: "none",
              }}
            />
          </Form.Item>

          <div className="flex justify-end">
            <span
              className="text-primary cursor-pointer hover:underline"
              onClick={() => {
                // TODO: Mở modal Quên mật khẩu
              }}
            >
              Quên mật khẩu
            </span>
          </div>

          <Form.Item className="mt-4!">
            <Button
              htmlType="submit"
              loading={loading}
              style={{
                background: "var(--color-primary)",
                height: 45,
                width: "100%",
                borderRadius: "calc(infinity * 1px)",
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Button
            style={{
              height: 45,
              width: "100%",
              borderRadius: "calc(infinity * 1px)",
            }}
            onClick={() => {
              // TODO: Đăng nhập bằng Google
            }}
          >
            Đăng nhập với Google
          </Button>

          <p className="text-center mt-6">
            Bạn chưa có tài khoản?{" "}
            <RegisterModal onSwitch={() => setOpen(false)}>
              <span className="text-primary cursor-pointer hover:underline">
                Đăng ký
              </span>
            </RegisterModal>
          </p>
        </Form>
      </Modal>
    </>
  );
};

export default LoginModal;