import { Button, Form, Input, Modal } from "antd";
import type { ReactElement } from "react";
import React, { useState } from "react";
import { formRules } from "../../../../common/utils/formRules";

const ChangePasswordModal = ({
  children,
  onSwitch,
}: {
  children: ReactElement;
  onSwitch?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = () => {
    setOpen(false);
    form.resetFields();
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
        onCancel={() => setOpen(false)}
        afterClose={() => form.resetFields()}
        open={open}
        width={600}
        className="rounded-xl border border-white/10 backdrop-blur-md"
        style={{
          background: `hsl(222.2 84% 4.9%)`,
        }}
        title={
          <p className="text-lg font-semibold text-white/90 tracking-wide">
            Đăng nhập
          </p>
        }
        footer={null}
      >
        <Form
          onFinish={handleSubmit}
          form={form}
          layout="vertical"
          className="my-6!"
        >
          <Form.Item
            label={<p className="text-base font-medium">Mật khẩu cũ</p>}
            className="flex-1"
            name={"oldPassword"}
            required
            hasFeedback
            rules={[formRules.required("Mật khẩu cũ")]}
          >
            <Input.Password
              className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
              style={{ height: 60, boxShadow: "none" }}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          <div className="flex items-center gap-6">
            <Form.Item
              label={<p className="text-base font-medium">Mật khẩu</p>}
              className="flex-1"
              name={"newPassword"}
              required
              hasFeedback
              rules={[formRules.required("Mật khẩu mới")]}
            >
              <Input.Password
                className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
                style={{ height: 60, boxShadow: "none" }}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <Form.Item
              label={<p className="text-base font-medium">Xác nhận mật khẩu</p>}
              className="flex-1"
              name={"confirmNewPassword"}
              required
              rules={[
                formRules.required("Xác nhận mật khẩu mới"),
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
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
                className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
                style={{ height: 60, boxShadow: "none" }}
                placeholder="Xác nhận mật khẩu"
              />
            </Form.Item>
          </div>

          <Form.Item className="mt-4!">
            <div className="flex items-center gap-4 justify-end">
              <Button onClick={() => setOpen(false)}>Đóng</Button>
              <Button
                htmlType="submit"
                style={{
                  background: `var(--color-primary)`,
                }}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ChangePasswordModal;
