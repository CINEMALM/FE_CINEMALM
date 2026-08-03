export const SEAT_STATUS = {
  HOLD: "HOLD",
  MYHOLD: "MYHOLD",
  BOOKED: "BOOKED",
  MYBOOKED: "MYBOOKED",
};

export const SEAT_STATUS_COLOR = {
  [SEAT_STATUS.HOLD]: "#38BDF8",
  [SEAT_STATUS.MYHOLD]: "#075985",
  [SEAT_STATUS.BOOKED]: "#F04420",
  [SEAT_STATUS.MYBOOKED]: "#FACC15",
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
