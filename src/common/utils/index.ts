import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { ISeat } from "../types/seat";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

export const antdInputNumberPropsCurrency = (
  min: number = 10000,
  max: number = 10000000,
) => ({
  min: min,
  max: max,
  formatter: (value?: number | string) =>
    value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "",
  parser: (value?: string) => Number(value?.replace(/\./g, "") || 0),
});

export const getSeatPrice = (seat: ISeat) => {
  const found = seat.price && seat.price.find((p) => p.seatType === seat.type);
  return found?.value || 0;
};

export const getGrowthColor = (value: number) => {
  if (value < 0) return "text-red-500";
  if (value === 0) return "text-yellow-500";
  return "text-green-500";
};
