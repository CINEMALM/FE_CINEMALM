import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { authService } from "../../../common/services/auth.service";
import { useAuthSelector } from "../../../common/stores/useAuthStore";
import ChangePasswordModal from "./components/ChangePasswordModal";

interface ProfileValues {
  userName: string;
  email: string;
  phone?: string;
}

const Profile = () => {
  const [form] = Form.useForm<ProfileValues>();
  const [hasChanges, setHasChanges] = useState(false);
  const user = useAuthSelector((state) => state.user);
  const setUser = useAuthSelector((state) => state.setUser);
  const update = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setHasChanges(false);
      message.success("Đã cập nhật thông tin tài khoản.");
    },
    onError: () => message.error("Không thể cập nhật thông tin tài khoản."),
  });

  useEffect(() => {
    form.setFieldsValue({
      userName: user?.userName || "",
      email: user?.email || "",
      phone: user?.phone,
    });
    setHasChanges(false);
  }, [form, user]);

  return (
    <div className="mx-4 mt-8 max-w-4xl sm:mx-6 sm:mt-12 xl:mx-auto">
      <Form
        form={form}
        onFinish={update.mutate}
        onValuesChange={(_, values: ProfileValues) => {
          setHasChanges(
            values.userName?.trim() !== (user?.userName || "").trim() ||
              (values.phone || "").trim() !== (user?.phone || "").trim(),
          );
        }}
        layout="vertical"
      >
        <Form.Item
          label="Họ và tên"
          name="userName"
          rules={[{ required: true, min: 2, message: "Vui lòng nhập họ tên." }]}
        >
          <Input className="h-11" placeholder="Nhập họ tên của bạn" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            {
              pattern: /^(0|\+84)[0-9]{9,10}$/,
              message: "Số điện thoại không đúng định dạng Việt Nam.",
            },
          ]}
        >
          <Input className="h-11" placeholder="Nhập số điện thoại" />
        </Form.Item>
        <Form.Item label="Email" name="email">
          <Input disabled className="h-11" />
        </Form.Item>
        <div className="flex items-center justify-end gap-3">
          <ChangePasswordModal>
            <Button disabled={update.isPending}>Đổi mật khẩu</Button>
          </ChangePasswordModal>
          <Button
            disabled={!hasChanges}
            loading={update.isPending}
            htmlType="submit"
            type="primary"
          >
            Lưu thông tin
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Profile;
