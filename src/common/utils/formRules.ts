import type { Rule } from "antd/es/form";

export const formRules = {
  required: (fieldName: string, type: "choose" | "type" = "type"): Rule => ({
    required: true,
    message: `Vui lòng ${type === "type" ? "nhập" : "chọn"} ${fieldName.toLowerCase()}!`,
  }),

  minLength: (label: string, min: number): Rule => ({
    min,
    message: `${label} ít nhất ${min} ký tự!`,
  }),

  maxLength: (label: string, max: number): Rule => ({
    max,
    message: `${label} tối đa ${max} ký tự!`,
  }),

  textRange: (label: string, min: number, max: number): Rule => ({
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      const length = value.trim().length;
      if (length < min) {
        return Promise.reject(new Error(`${label} ít nhất ${min} ký tự!`));
      }
      if (length > max) {
        return Promise.reject(new Error(`${label} tối đa ${max} ký tự!`));
      }
      return Promise.resolve();
    },
  }),

  password: (): Rule => ({
    validator: (_, value) => {
      if (!value) return Promise.resolve();
      if (value.length < 8) {
        return Promise.reject(new Error("Mật khẩu phải có ít nhất 8 ký tự!"));
      }
      if (!/[A-Za-z]/.test(value)) {
        return Promise.reject(
          new Error("Mật khẩu phải có ít nhất một chữ cái!"),
        );
      }
      if (!/\d/.test(value)) {
        return Promise.reject(
          new Error("Mật khẩu phải có ít nhất một chữ số!"),
        );
      }
      return Promise.resolve();
    },
  }),
};
