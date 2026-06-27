import { Badge, Tag, Tooltip } from "antd";
import { getAgeBadge } from "../common/utils/agePolicy";
import type { IMovie } from "../common/types/movie";
import type { ICategory } from "../common/types/category";
import dayjs from "dayjs";
import { Link } from "react-router";

const CardFlim = ({ flim }: { flim: IMovie }) => {
  const { label, text, description } = getAgeBadge(flim?.ageRequire);
  return (
    <Link
      to={`/movie/${flim._id}`}
      className="group cursor-pointer text-white!"
    >
      <Badge.Ribbon
        text={
          flim?.language
            ? flim.language +
              (flim.subLanguage ? ` (P.đề ${flim.subLanguage})` : "")
            : ""
        }
        color={"#6B7280"}
        placement="start"
        style={{ top: 35 }}
      >
        <Badge.Ribbon
          text={
            <Tooltip title={description}>
              {label.toUpperCase()}: {text}
            </Tooltip>
          }
          color={"#ef4444"}
          placement="start"
        >
          <div className={` overflow-hidden rounded-lg max-h-[268px]`}>
            <img
              src={
                flim?.poster ||
                "https://pbs.twimg.com/profile_images/1258424935032041473/SCpI1POo_400x400.jpg"
              }
              alt=""
              className={`min-h-[268px] group-hover:scale-105 duration-300 object-cover`}
            />
          </div>
        </Badge.Ribbon>
      </Badge.Ribbon>

      <div className="mt-4">
        <p className="text-sm text-gray-300/50 mb-1">
          {(flim?.category as ICategory[])
            ?.map((item) => item.name)
            ?.join(", ") || "Chưa cập nhật"}
        </p>
        <h3
          className="uppercase font-semibold line-clamp-2 h-12 text-base group-hover:text-primary duration-300"
          title={flim?.name ? flim.name : ""}
        >
          {flim?.name || "Chưa cập nhật"}
        </h3>
        <Tag color="green" className="text-sm! mt-2!">
          {dayjs(flim.releaseDate).format("YYYY-MM-DD") || "Chưa cập nhật"}
        </Tag>
      </div>
    </Link>
  );
};

export default CardFlim;
