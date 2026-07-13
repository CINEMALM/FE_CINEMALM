import { seatTypeColor } from "../../../../../common/constants";
import {
  SEAT_STATUS,
  SEAT_STATUS_COLOR,
} from "../../../../../common/constants/seat";

const GuideSeat = () => {
  return (
    <div className="max-w-7xl xl:mx-auto mx-6">
      <p className="mt-6">Tình trạng ghế:</p>
      <div className="mt-4  flex gap-4">
        <div className="flex items-center gap-2">
          <div
            className="rounded-md"
            style={{
              backgroundImage: `url("https://res.cloudinary.com/dpplfiyki/image/upload/v1764580281/The%CC%82m_tie%CC%82u_%C4%91e%CC%82%CC%80_lbgdt5.png")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: 40,
              backgroundColor: SEAT_STATUS_COLOR[SEAT_STATUS.BOOKED],
              height: 40,
            }}
          />

          <p>Ghế đã đặt</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="rounded-md"
            style={{
              backgroundImage: `url("https://res.cloudinary.com/dpplfiyki/image/upload/v1764580281/The%CC%82m_tie%CC%82u_%C4%91e%CC%82%CC%80_lbgdt5.png")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: 40,
              backgroundColor: SEAT_STATUS_COLOR[SEAT_STATUS.MYBOOKED],
              height: 40,
            }}
          />

          <p>Ghế của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="rounded-md"
            style={{
              background: SEAT_STATUS_COLOR["HOLD"],
              width: 40,
              height: 40,
            }}
          />
          <p>Ghế đang giữ</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="rounded-md"
            style={{
              background: SEAT_STATUS_COLOR["MYHOLD"],
              width: 40,
              height: 40,
            }}
          />
          <p>Ghế bạn đang giữ</p>
        </div>
      </div>
      <p className="mt-6">Loại ghế:</p>
      <div className="flex items-center gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div
            className="rounded-md"
            style={{
              background: seatTypeColor["NORMAL"],
              width: 40,
              height: 40,
            }}
          />
          <p>Ghế thường</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="rounded-md"
            style={{
              background: seatTypeColor["VIP"],
              width: 40,
              height: 40,
            }}
          />
          <p>Ghế VIP</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="rounded-md"
            style={{
              background: seatTypeColor["COUPLE"],
              width: 40,
              height: 40,
            }}
          />
          <p>Ghế đôi</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="rounded-md"
            style={{
              background: `#ef4444`,
              width: 40,
              height: 40,
            }}
          />
          <p>Ghế không khả dụng</p>
        </div>
      </div>
    </div>
  );
};

export default GuideSeat;
