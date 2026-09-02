import { Button, Form, Input, Modal } from "antd";
import type { ReactElement } from "react";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useLoginMutation } from "../common/hooks/useAuth";
import { useMessage } from "../common/hooks/useMessage";
import { authService } from "../common/services/auth.service";
import type { ILoginPayload } from "../common/types/auth";
import { useAuthSelector, useAuthStore } from "../common/stores/useAuthStore";
import ForgotPasswordModal from "./ForgotPasswordModal";
import RegisterModal from "./RegisterModal";

const LoginModal = ({
  children,
  onSwitch,
  global = false,
}: {
  children?: ReactElement;
  onSwitch?: () => void;
  global?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const globalOpen = useAuthSelector((state) => state.openModal);
  const setGlobalOpen = useAuthSelector((state) => state.setOpenModal);
  const clearPendingLogin = useAuthSelector((state) => state.clearPendingLogin);
  const navigate = useNavigate();
  const [form] = Form.useForm<ILoginPayload>();
  const loginMutation = useLoginMutation();
  const { HandleError, antdMessage } = useMessage();

  const handleSubmit = async (values: ILoginPayload) => {
    try {
      await loginMutation.mutateAsync(values);
      antdMessage.success("Đăng nhập thành công.");
      setOpen(false);
      setGlobalOpen(false);
      const { pendingAction, pendingPath, clearPendingLogin } =
        useAuthStore.getState();
      clearPendingLogin();
      if (pendingAction) {
        pendingAction();
      } else if (pendingPath) {
        navigate(pendingPath);
      }
    } catch (error) {
      HandleError(error, {
        fallback: "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
      });
    }
  };

  return (
    <>
      {children &&
        React.cloneElement(children, {
          onClick: () => {
            if (onSwitch) onSwitch();
            clearPendingLogin();
            setOpen(true);
          },
        } as { onClick: () => void })}

      <Modal
        open={global ? globalOpen : open}
        onCancel={() => {
          setOpen(false);
          setGlobalOpen(false);
          if (global) clearPendingLogin();
        }}
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
            <ForgotPasswordModal
              onSwitch={() => {
                setOpen(false);
                setGlobalOpen(false);
              }}
            >
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

          <div className="relative my-5 border-t border-white/10">
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[#141414] px-3 text-xs text-[#9A9A9A]">
              hoặc
            </span>
          </div>
          <Button className="h-11 w-full" onClick={authService.googleLogin}>
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
