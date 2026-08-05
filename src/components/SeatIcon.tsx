import type { ISeat } from "../common/types/seat";

type SeatType = ISeat["type"];

const seatShapeClass = (type: SeatType, compact = false) => {
  if (type === "NORMAL") {
    return compact
      ? "h-5 w-7 rounded-t-[7px] rounded-b-[2px]"
      : "h-6 w-[78%] justify-self-center rounded-t-[7px] rounded-b-[2px] sm:h-7 lg:h-8";
  }

  if (type === "VIP") {
    return compact
      ? "h-7 w-9 rounded-t-[11px] rounded-b-[4px]"
      : "h-8 w-full rounded-t-[12px] rounded-b-[4px] border-2 sm:h-10 lg:h-11";
  }

  return compact
    ? "h-7 w-12 rounded-t-[11px] rounded-b-[4px]"
    : "h-8 w-full rounded-t-[13px] rounded-b-[4px] border-2 sm:h-10 lg:h-11";
};

interface SeatIconProps {
  type: SeatType;
  color: string;
  label?: string;
  compact?: boolean;
  darkText?: boolean;
  className?: string;
}

const SeatIcon = ({
  type,
  color,
  label,
  compact = false,
  darkText = false,
  className = "",
}: SeatIconProps) => (
  <span
    className={`relative flex shrink-0 items-center justify-center border border-white/15 font-black shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)] ${seatShapeClass(
      type,
      compact,
    )} ${darkText ? "text-[#111318]" : "text-white"} ${className}`}
    style={{ backgroundColor: color }}
  >
    {type === "VIP" && (
      <>
        <span className="absolute inset-x-[20%] bottom-1 top-[24%] rounded-t-lg border border-black/15 shadow-inner" />
        <span
          className={`absolute -left-1 bottom-0 rounded-full opacity-70 ${
            compact ? "h-3 w-1.5" : "h-1/2 w-2"
          }`}
          style={{ backgroundColor: color }}
        />
        <span
          className={`absolute -right-1 bottom-0 rounded-full opacity-70 ${
            compact ? "h-3 w-1.5" : "h-1/2 w-2"
          }`}
          style={{ backgroundColor: color }}
        />
      </>
    )}
    {type === "COUPLE" && (
      <span className="absolute inset-y-1 left-1/2 w-px bg-black/15" />
    )}
    {label && <span className="relative z-10">{label}</span>}
    <span
      aria-hidden="true"
      className="absolute -bottom-1 left-[-2px] h-1.5 w-[calc(100%+4px)] rounded-full opacity-85"
      style={{ backgroundColor: color }}
    />
  </span>
);

export default SeatIcon;
