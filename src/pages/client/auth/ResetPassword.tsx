import { Button, Form, Input, Result } from "antd";
import { Link, useSearchParams } from "react-router";
import { useResetPasswordMutation } from "../../../common/hooks/useAuth";
import { useMessage } from "../../../common/hooks/useMessage";
import { formRules } from "../../../common/utils/formRules";

type ResetPasswordValues = {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const [form] = Form.useForm<ResetPasswordValues>();
  const resetPasswordMutation = useResetPasswordMutation();
  const { HandleError, antdMessage } = useMessage();

  const handleSubmit = async (values: ResetPasswordValues) => {
    try {
      await resetPasswordMutation.mutateAsync({
        email: values.email,
        code: values.code,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      antdMessage.success(
        "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.",
      );
      form.resetFields();
    } catch (error) {
      HandleError(error, { fallback: "Không thể đặt lại mật khẩu." });
    }
  };

  if (resetPasswordMutation.isSuccess) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20">
        <Result
          status="success"
          title="Đặt lại mật khẩu thành công"
          subTitle="Bạn có thể quay lại trang chủ và đăng nhập bằng mật khẩu mới."
          extra={
            <Link to="/">
              <Button type="primary">Về trang chủ</Button>
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-20">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#DC0000]">
        CinemaLM Account
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold text-[#F2F2F2]">
        Đặt lại mật khẩu
      </h1>
      <p className="mt-3 text-sm leading-7 text-[#9A9A9A]">
        Nhập mã 6 số trong email và mật khẩu mới cho tài khoản của bạn.
      </p>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-8"
        initialValues={{ email: initialEmail }}
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
            style={{ height: 56, boxShadow: "none" }}
          />
        </Form.Item>

        <Form.Item
          name="code"
          label={<p className="text-base font-medium">Mã đặt lại mật khẩu</p>}
          rules={[
            formRules.required("Mã đặt lại mật khẩu"),
            {
              pattern: /^\d{6}$/,
              message: "Mã đặt lại mật khẩu gồm 6 chữ số!",
            },
          ]}
        >
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="Nhập mã 6 số"
            className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
            style={{ height: 56, boxShadow: "none", letterSpacing: "0.2em" }}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<p className="text-base font-medium">Mật khẩu mới</p>}
          rules={[
            formRules.required("Mật khẩu mới"),
            formRules.minLength("Mật khẩu", 8),
          ]}
        >
          <Input.Password
            placeholder="Mật khẩu mới"
            className="bg-transparent! text-white placeholder:text-white/50! border-white/10!"
            style={{ height: 56, boxShadow: "none" }}
          />
        </Form.Item>

        <Form.Item
          name="password_confirmation"
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

        <Button
          htmlType="submit"
          loading={resetPasswordMutation.isPending}
          style={{
            background: "var(--color-primary)",
            height: 45,
            width: "100%",
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          Đặt lại mật khẩu
        </Button>
      </Form>
    </section>
  );
};

export default ResetPassword;
