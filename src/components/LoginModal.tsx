import { Button, Form, Input, Modal } from "antd";
import type { ReactElement } from "react";
import React, { useState } from "react";
import { useLoginMutation } from "../common/hooks/useAuth";
import { useMessage } from "../common/hooks/useMessage";
import type { ILoginPayload } from "../common/types/auth";
import ForgotPasswordModal from "./ForgotPasswordModal";
import RegisterModal from "./RegisterModal";

const LoginModal = ({
  children,
  onSwitch,
}: {
  children: ReactElement;
  onSwitch?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<ILoginPayload>();
  const loginMutation = useLoginMutation();
  const { HandleError, antdMessage } = useMessage();

  const handleSubmit = async (values: ILoginPayload) => {
    try {
      await loginMutation.mutateAsync(values);
      antdMessage.success("Đăng nhập thành công.");
      setOpen(false);
    } catch (error) {
      HandleError(error, {
        fallback: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      });
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
        className="border border-white/10 backdrop-blur-md"
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
                height: 56,
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
                height: 56,
                boxShadow: "none",
              }}
            />
          </Form.Item>

          <div className="flex justify-end">
            <ForgotPasswordModal>
              <span className="text-primary cursor-pointer hover:underline">
                Quên mật khẩu
              </span>
            </ForgotPasswordModal>
          </div>

          <Form.Item className="mt-4!">
            <Button
              htmlType="submit"
              loading={loginMutation.isPending}
              style={{
                background: "var(--color-primary)",
                height: 45,
                width: "100%",
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

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
