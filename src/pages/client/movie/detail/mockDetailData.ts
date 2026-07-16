import dayjs from "dayjs";
import type { IMovie } from "../../../../common/types/movie";
import type { IRoom } from "../../../../common/types/room";
import type {
  IShowtime,
  IWeekdayShowtime,
} from "../../../../common/types/showtime";

export const mockRooms: IRoom[] = [
  {
    _id: "mock-room-1",
    name: "Phòng 01",
    description: "Phòng chiếu tiêu chuẩn",
    capacity: 96,
    rows: 8,
    cols: 12,
    status: true,
  },
  {
    _id: "mock-room-2",
    name: "Phòng 02",
    description: "Phòng chiếu VIP",
    capacity: 72,
    rows: 6,
    cols: 12,
    status: true,
  },
];

const mockMovie = {
  _id: "mock-movie",
  name: "CinemaLM Preview",
} as IMovie;

const createMockShowtime = (
  date: string,
  time: string,
  index: number,
  room = mockRooms[index % mockRooms.length],
): IShowtime => {
  const startTime = dayjs(`${date} ${time}`);

  return {
    _id: `mock-showtime-${date}-${time.replace(":", "")}`,
    movieId: mockMovie,
    roomId: room,
    startTime: startTime.toISOString(),
    endTime: startTime.add(120, "minute").toISOString(),
    dayOfWeek: startTime.day(),
    price: [
      { _id: `normal-${index}`, seatType: "NORMAL", value: 70000 },
      { _id: `vip-${index}`, seatType: "VIP", value: 90000 },
      { _id: `couple-${index}`, seatType: "COUPLE", value: 180000 },
    ],
    status: "scheduled",
    updatedAt: new Date().toISOString(),
    bookedCount: 18 + index * 3,
  };
};

export const createMockWeekdayShowtimes = (): IWeekdayShowtime =>
  Array.from({ length: 7 }, (_, dayIndex) => {
    const date = dayjs().add(dayIndex, "day").format("YYYY-MM-DD");
    const times =
      dayIndex % 2 === 0
        ? ["09:00", "11:30", "14:15", "17:00", "19:30", "22:00"]
        : ["10:00", "13:00", "16:15", "18:45", "21:15"];

    return [
      date,
      times.map((time, timeIndex) =>
        createMockShowtime(date, time, dayIndex + timeIndex),
      ),
    ] as const;
  }).reduce<IWeekdayShowtime>((result, [date, showtimes]) => {
    result[date] = showtimes;
    return result;
  }, {});

export type MockSeatState = "available" | "selected" | "unavailable";

export interface MockGuideSeat {
  id: string;
  label: string;
  type: "NORMAL" | "VIP" | "COUPLE";
  state: MockSeatState;
  span?: number;
}

export const mockGuideSeats: MockGuideSeat[][] = Array.from(
  { length: 7 },
  (_, rowIndex) => {
    const rowLabel = String.fromCharCode(65 + rowIndex);
    const isCoupleRow = rowIndex >= 5;
    const seatCount = isCoupleRow ? 5 : 10;

    return Array.from({ length: seatCount }, (_, colIndex) => {
      const firstSeatNumber = isCoupleRow ? colIndex * 2 + 1 : colIndex + 1;
      const secondSeatNumber = firstSeatNumber + 1;
      const label = isCoupleRow
        ? `${rowLabel}${firstSeatNumber}-${rowLabel}${secondSeatNumber}`
        : `${rowLabel}${firstSeatNumber}`;
      const type = isCoupleRow ? "COUPLE" : rowIndex >= 2 ? "VIP" : "NORMAL";
      const stateMap: Record<string, MockSeatState> = {
        A2: "unavailable",
        A7: "unavailable",
        B4: "unavailable",
        B5: "unavailable",
        D8: "unavailable",
        E1: "unavailable",
        "F5-F6": "unavailable",
        "G9-G10": "unavailable",
      };

      return {
        id: `mock-seat-${label}`,
        label,
        type,
        state: stateMap[label] || "available",
        span: isCoupleRow ? 2 : 1,
      };
    });
  },
);
