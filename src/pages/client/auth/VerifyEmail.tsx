import { Button, Form, Input, Result } from "antd";
import { Link, useSearchParams } from "react-router";
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from "../../../common/hooks/useAuth";
import { useMessage } from "../../../common/hooks/useMessage";
import { formRules } from "../../../common/utils/formRules";

type VerifyEmailValues = {
  email: string;
  code: string;
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const [form] = Form.useForm<VerifyEmailValues>();
  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();
  const { HandleError, antdMessage } = useMessage();

  const handleSubmit = async (values: VerifyEmailValues) => {
    try {
      await verifyMutation.mutateAsync({
        email: values.email,
        code: values.code,
      });
      antdMessage.success("Xác thực email thành công. Bạn có thể đăng nhập.");
    } catch (error) {
      HandleError(error, {
        fallback: "Mã xác thực không hợp lệ hoặc đã hết hạn.",
      });
    }
  };

  const handleResend = async () => {
    const email = form.getFieldValue("email") || initialEmail;

    if (!email) {
      antdMessage.warning("Vui lòng nhập email trước khi gửi lại mã.");
      return;
    }

    try {
      await resendMutation.mutateAsync({ email });
      antdMessage.success("Đã gửi lại mã xác thực. Vui lòng kiểm tra email.");
    } catch (error) {
      HandleError(error, { fallback: "Không thể gửi lại mã xác thực." });
    }
  };

  if (verifyMutation.isSuccess) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20">
        <Result
          status="success"
          title="Xác thực email thành công"
          subTitle="Tài khoản của bạn đã được kích hoạt. Hãy quay lại trang chủ để đăng nhập và đặt vé."
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
        Xác thực email
      </h1>
      <p className="mt-3 text-sm leading-7 text-[#9A9A9A]">
        Nhập mã 6 số được gửi đến email của bạn. Mã có thời hạn ngắn để bảo vệ
        tài khoản.
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
          label={<p className="text-base font-medium">Mã xác thực</p>}
          rules={[
            formRules.required("Mã xác thực"),
            {
              pattern: /^\d{6}$/,
              message: "Mã xác thực gồm 6 chữ số!",
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

        <Button
          htmlType="submit"
          loading={verifyMutation.isPending}
          style={{
            background: "var(--color-primary)",
            height: 45,
            width: "100%",
            borderRadius: 2,
            fontWeight: 700,
          }}
        >
          Xác thực email
        </Button>

        <Button
          type="link"
          loading={resendMutation.isPending}
          onClick={handleResend}
          className="mt-4 w-full! text-primary!"
        >
          Gửi lại mã xác thực
        </Button>
      </Form>
    </section>
  );
};

export default VerifyEmail;
