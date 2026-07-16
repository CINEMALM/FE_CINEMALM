import { Button, Form, Input, Modal } from "antd";
import type { ReactElement } from "react";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useForgotPasswordMutation } from "../common/hooks/useAuth";
import { useMessage } from "../common/hooks/useMessage";
import type { IForgotPasswordPayload } from "../common/types/auth";
import { formRules } from "../common/utils/formRules";

const ForgotPasswordModal = ({
  children,
  onSwitch,
}: {
  children: ReactElement;
  onSwitch?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<IForgotPasswordPayload>();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const navigate = useNavigate();
  const { HandleError, antdMessage } = useMessage();

  const handleSubmit = async (values: IForgotPasswordPayload) => {
    try {
      await forgotPasswordMutation.mutateAsync(values);
      antdMessage.success(
        "Đã gửi mã đặt lại mật khẩu. Vui lòng kiểm tra email.",
      );
      setOpen(false);
      navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      HandleError(error, { fallback: "Không thể gửi email đặt lại mật khẩu." });
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
                height: 56,
                boxShadow: "none",
              }}
            />
          </Form.Item>

          <Form.Item className="pt-4!">
            <Button
              htmlType="submit"
              loading={forgotPasswordMutation.isPending}
              style={{
                background: "var(--color-primary)",
                height: 45,
                width: "100%",
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              Gửi mã đặt lại mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ForgotPasswordModal;
