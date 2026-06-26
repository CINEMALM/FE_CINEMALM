export const SEAT_STATUS = {
  HOLD: "HOLD",
  MYHOLD: "MYHOLD",
  BOOKED: "BOOKED",
  MYBOOKED: "MYBOOKED",
};

export const SEAT_STATUS_COLOR = {
  [SEAT_STATUS.HOLD]: "#10b981",
  [SEAT_STATUS.MYHOLD]: "#3b82f6",
  [SEAT_STATUS.BOOKED]: "#ef4444",
  [SEAT_STATUS.MYBOOKED]: "#8b5cf6",
};

export const SEAT_TYPE: Record<string, string> = {
  VIP: "VIP",
  NORMAL: "NORMAL",
  COUPLE: "COUPLE",
};
export const SEAT_TYPE_LABEL: Record<string, string> = {
  VIP: "Ghế vip",
  NORMAL: "Ghế thường",
  COUPLE: "Ghế đôi",
};
