import Echo from "laravel-echo";
import Pusher from "pusher-js";

type SeatRealtimePayload = {
  event_id: string;
  showtime_id: number | string;
  seats: {
    seat_status_id: number | string;
    seat_id: number | string;
    label: string | null;
    status: string;
    user_id: number | string | null;
    held_until?: string | null;
  }[];
};

let echo: Echo<"reverb"> | null = null;

const getEcho = () => {
  const key = import.meta.env.VITE_REVERB_APP_KEY;
  const host = import.meta.env.VITE_REVERB_HOST || window.location.hostname;
  const port = Number(import.meta.env.VITE_REVERB_PORT || 8080);
  const scheme = import.meta.env.VITE_REVERB_SCHEME || "http";

  if (!key) return null;

  if (!echo) {
    window.Pusher = Pusher;
    echo = new Echo({
      broadcaster: "reverb",
      key,
      wsHost: host,
      wsPort: port,
      wssPort: port,
      forceTLS: scheme === "https",
      enabledTransports: ["ws", "wss"],
    });
  }

  return echo;
};

export const subscribeShowtimeSeatEvents = (
  showtimeId: string,
  onEvent: (event: SeatRealtimePayload) => void,
) => {
  const realtime = getEcho();

  if (!realtime) {
    return () => undefined;
  }

  const channelName = `showtimes.${showtimeId}.seats`;
  const channel = realtime.channel(channelName);

  channel.listen(".SeatHeld", onEvent);
  channel.listen(".SeatReleased", onEvent);
  channel.listen(".SeatBooked", onEvent);

  return () => {
    realtime.leave(channelName);
  };
};
