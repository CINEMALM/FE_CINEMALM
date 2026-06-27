import { Button, Form, Input, Modal } from "antd";
import type { ReactElement } from "react";
import React, { useState } from "react";
import { formRules } from "../common/utils/formRules";
import LoginModal from "./LoginModal";

const RegisterModal = ({
  children,
  onSwitch,
}: {
  children: ReactElement;
  onSwitch?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    const { confirmPassword, firstName, lastName, ...payload } = values;

    console.log({
      userName: `${firstName} ${lastName}`,
      ...payload,
    });

    // TODO:
    // - Gọi API đăng ký tài khoản
    // - Hiển thị thông báo thành công/thất bại
    // - Đóng modal sau khi đăng ký thành công
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
          top: 30,
          background: "hsl(222.2 84% 4.9%)",
        }}
        title={
          <p className="text-lg font-semibold text-white/90 tracking-wide">
            Đăng ký
          </p>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="my-6!"
        >
          <div className="flex gap-4">
            <Form.Item
              name="firstName"
              label={<p className="text-base font-medium">Họ</p>}
              className="flex-1"
              rules={[
                formRules.required("Họ"),
                formRules.textRange("Họ", 2, 25),
              ]}
            >
              <Input
                placeholder="Họ"
                className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
                style={{ height: 60, boxShadow: "none" }}
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              label={<p className="text-base font-medium">Tên</p>}
              className="flex-1"
              rules={[
                formRules.required("Tên"),
                formRules.textRange("Tên", 2, 25),
              ]}
            >
              <Input
                placeholder="Tên"
                className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
                style={{ height: 60, boxShadow: "none" }}
              />
            </Form.Item>
          </div>

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
              style={{ height: 60, boxShadow: "none" }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label={<p className="text-base font-medium">Số điện thoại</p>}
            rules={[
              formRules.required("Số điện thoại"),
              {
                pattern: /^(0|\+84)(\d{9})$/,
                message: "Vui lòng nhập số điện thoại hợp lệ!",
              },
            ]}
          >
            <Input
              placeholder="Số điện thoại"
              className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
              style={{ height: 60, boxShadow: "none" }}
            />
          </Form.Item>

          <div className="flex gap-6">
            <Form.Item
              name="password"
              label={<p className="text-base font-medium">Mật khẩu</p>}
              className="flex-1"
              hasFeedback
              rules={[formRules.required("Mật khẩu")]}
            >
              <Input.Password
                placeholder="Mật khẩu"
                className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
                style={{ height: 60, boxShadow: "none" }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={
                <p className="text-base font-medium">Xác nhận mật khẩu</p>
              }
              className="flex-1"
              rules={[
                formRules.required("Xác nhận mật khẩu"),
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value === getFieldValue("password")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Xác nhận mật khẩu"
                className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
                style={{ height: 60, boxShadow: "none" }}
              />
            </Form.Item>
          </div>

          <Form.Item className="mt-4!">
            <Button
              htmlType="submit"
              style={{
                background: "var(--color-primary)",
                height: 45,
                width: "100%",
                borderRadius: "calc(infinity * 1px)",
              }}
            >
              Đăng ký
            </Button>
          </Form.Item>

          <p className="text-center">
            Bạn đã có tài khoản?{" "}
            <LoginModal onSwitch={() => setOpen(false)}>
              <span className="text-primary cursor-pointer hover:underline">
                Đăng nhập
              </span>
            </LoginModal>
          </p>
        </Form>
      </Modal>
    </>
  );
};

export default RegisterModal;