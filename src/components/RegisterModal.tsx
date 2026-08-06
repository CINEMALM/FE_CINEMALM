import { GoogleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import axios from "axios";
import type { ReactElement } from "react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useRegisterMutation } from "../common/hooks/useAuth";
import { useMessage } from "../common/hooks/useMessage";
import { authService } from "../common/services/auth.service";
import type { IRegisterPayload } from "../common/types/auth";
import { initCsrfToken } from "../common/utils/api";
import { formRules } from "../common/utils/formRules";
import LoginModal from "./LoginModal";

type RegisterFormValues = IRegisterPayload & {
  firstName: string;
  lastName: string;
};

const RegisterModal = ({
  children,
  onSwitch,
}: {
  children: ReactElement;
  onSwitch?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<RegisterFormValues>();
  const registerMutation = useRegisterMutation();
  const navigate = useNavigate();
  const { HandleError, antdMessage } = useMessage();

  useEffect(() => {
    if (!open) return;
    void initCsrfToken().catch(() => undefined);
  }, [open]);

  const handleSubmit = async (values: RegisterFormValues) => {
    const payload: IRegisterPayload = {
      userName: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
      email: values.email,
      phone: values.phone,
      password: values.password,
      confirmPassword: values.confirmPassword,
    };

    try {
      const response = await registerMutation.mutateAsync(payload);
      const requiresEmailVerification =
        response.data?.requires_email_verification !== false;
      if (!requiresEmailVerification) {
        antdMessage.success("Đăng ký thành công. Bạn có thể đăng nhập ngay.");
      } else {
        antdMessage.success(
          "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.",
        );
      }
      setOpen(false);
      if (requiresEmailVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errors = error.response?.data?.errors as
          | Record<string, string[]>
          | undefined;
        const fieldMap: Record<string, keyof RegisterFormValues> = {
          user_name: "firstName",
          email: "email",
          phone: "phone",
          password: "password",
        };
        const fieldErrors = Object.entries(errors || {}).flatMap(
          ([field, messages]) =>
            fieldMap[field]
              ? [{ name: fieldMap[field], errors: messages }]
              : [],
        );
        if (fieldErrors.length) form.setFields(fieldErrors);
      }
      HandleError(error, {
        fallback: "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
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
        footer={null}
        className="border border-white/10 backdrop-blur-md"
        style={{ top: 30 }}
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
          onFinishFailed={() =>
            antdMessage.warning("Vui lòng kiểm tra lại các trường đăng ký.")
          }
          className="my-6!"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              name="firstName"
              label={<p className="text-base font-medium">Họ</p>}
              rules={[
                formRules.required("Họ"),
                formRules.textRange("Họ", 2, 25),
              ]}
            >
              <Input
                placeholder="Họ"
                className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
                style={{ height: 56, boxShadow: "none" }}
              />
            </Form.Item>

            <Form.Item
              name="lastName"
              label={<p className="text-base font-medium">Tên</p>}
              rules={[
                formRules.required("Tên"),
                formRules.textRange("Tên", 2, 25),
              ]}
            >
              <Input
                placeholder="Tên"
                className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
                style={{ height: 56, boxShadow: "none" }}
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
              style={{ height: 56, boxShadow: "none" }}
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
              style={{ height: 56, boxShadow: "none" }}
            />
          </Form.Item>

          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              name="password"
              label={<p className="text-base font-medium">Mật khẩu</p>}
              hasFeedback
              rules={[formRules.required("Mật khẩu"), formRules.password()]}
            >
              <Input.Password
                placeholder="Mật khẩu"
                className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
                style={{ height: 56, boxShadow: "none" }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<p className="text-base font-medium">Xác nhận mật khẩu</p>}
              dependencies={["password"]}
              hasFeedback
              rules={[
                formRules.required("Xác nhận mật khẩu"),
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value === getFieldValue("password")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Xác nhận mật khẩu"
                className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
                style={{ height: 56, boxShadow: "none" }}
              />
            </Form.Item>
          </div>

          <Form.Item className="mt-4!">
            <Button
              htmlType="submit"
              loading={registerMutation.isPending}
              style={{
                background: "var(--color-primary)",
                height: 45,
                width: "100%",
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              Đăng ký
            </Button>
          </Form.Item>

          <div className="relative my-5 border-t border-white/10">
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[#141414] px-3 text-xs text-[#9A9A9A]">
              hoặc
            </span>
          </div>
          <Button
            type="default"
            icon={<GoogleOutlined />}
            className="h-11 w-full border-white/15 font-bold hover:border-[#DC0000]! hover:text-[#DC0000]!"
            onClick={authService.googleLogin}
          >
            Đăng ký với Google
          </Button>

          <p className="mt-5 text-center">
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
