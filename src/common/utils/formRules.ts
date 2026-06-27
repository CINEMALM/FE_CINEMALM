// utils/formRules.ts
import type { Rule } from "antd/es/form";

export const formRules = {
  required: (fieldName: string, type: "choose" | "type" = "type"): Rule => ({
    required: true,
    message: `Vui lòng ${
      type === "type" ? "nhập" : "chọn"
    } ${fieldName.toLowerCase()}!`,
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
      if (length < min)
        return Promise.reject(new Error(`${label} ít nhất ${min} ký tự!`));
      if (length > max)
        return Promise.reject(new Error(`${label} tối đa ${max} ký tự!`));
      return Promise.resolve();
    },
  }),
};
