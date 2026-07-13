import { Button, Form, Input } from "antd";
import { useState } from "react";
import { useAuthSelector } from "../../../common/stores/useAuthStore";
import { formRules } from "../../../common/utils/formRules";
import UploadImage from "../../../components/UploadImage";
import ChangePasswordModal from "./components/ChangePasswordModal";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const user = useAuthSelector((state) => state.user);

  const onFinish = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 400);
  };

  return (
    <div className="mt-12 max-w-4xl xl:mx-auto mx-6">
      <Form
        onFinish={onFinish}
        initialValues={{
          avatar: user?.avatar,
          userName: user?.userName,
          email: user?.email,
          phone: user?.phone,
        }}
        layout="vertical"
      >
        <Form.Item
          label="Ảnh đại diện"
          required
          name={"avatar"}
          rules={[formRules.required("Ảnh đại diện", "choose")]}
        >
          <UploadImage width={100} height={100} />
        </Form.Item>

        <Form.Item
          label="Họ và tên"
          name={"userName"}
          rules={[formRules.required("Họ và tên")]}
        >
          <Input style={{ height: 45 }} placeholder="Nhập họ tên của bạn" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name={"phone"}
          rules={[formRules.required("Số điện thoại")]}
        >
          <Input style={{ height: 45 }} placeholder="Nhập họ tên của bạn" />
        </Form.Item>

        <Form.Item
          label="email"
          name={"email"}
          rules={[formRules.required("Email")]}
        >
          <Input
            disabled
            style={{ height: 45 }}
            placeholder="Nhập họ tên của bạn"
          />
        </Form.Item>

        <Form.Item>
          <div className="flex items-center gap-4 justify-end">
            <ChangePasswordModal>
              <Button disabled={loading} style={{ height: 40 }}>
                Đổi mật khẩu
              </Button>
            </ChangePasswordModal>

            <Button
              loading={loading}
              htmlType="submit"
              type="primary"
              style={{ height: 40 }}
            >
              Lưu thông tin
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Profile;
