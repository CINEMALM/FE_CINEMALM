import { Button, Form, Input, Modal } from "antd";
import type { ReactElement } from "react";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useRegisterMutation } from "../common/hooks/useAuth";
import { useMessage } from "../common/hooks/useMessage";
import type { IRegisterPayload } from "../common/types/auth";
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

  const handleSubmit = async (values: RegisterFormValues) => {
    const payload: IRegisterPayload = {
      userName: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
      email: values.email,
      phone: values.phone,
      password: values.password,
      confirmPassword: values.confirmPassword,
    };

    try {
      await registerMutation.mutateAsync(payload);
      antdMessage.success(
        "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã xác thực.",
      );
      setOpen(false);
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
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
              rules={[formRules.required("Mật khẩu")]}
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
