import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const CountTime = ({
  navCount,
  time,
}: {
  navCount?: number;
  time?: number;
}) => {
  const [timeLeft, setTimeLeft] = useState(time ? time : 300);
  const nav = useNavigate();
  const checkingNavigate = () => {
    if (window.history.length > 1) {
      nav(navCount ? navCount : -1);
    } else {
      nav("/");
    }
  };
  useEffect(() => {
    if (timeLeft <= 0) {
      checkingNavigate();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  return (
    <div className="text-2xl font-semibold text-red-500 w-16 text-end">
      {formatTime(timeLeft)}
    </div>
  );
};

export default CountTime;
