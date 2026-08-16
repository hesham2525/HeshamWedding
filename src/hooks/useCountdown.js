import { useEffect, useMemo, useState } from "react";

function getTimeLeft(target) {
  const total = Math.max(0, new Date(target).getTime() - Date.now());

  return {
    days: Math.floor(total / 86400000),
    hours: Math.floor((total / 3600000) % 24),
    minutes: Math.floor((total / 60000) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export function useCountdown(target) {
  const [time, setTime] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(getTimeLeft(target));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [target]);

  return useMemo(
    () => [
      ["Days", time.days],
      ["Hours", time.hours],
      ["Minutes", time.minutes],
      ["Seconds", time.seconds],
    ],
    [time]
  );
}
