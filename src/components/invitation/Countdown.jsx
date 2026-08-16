import { useCountdown } from "../../hooks/useCountdown";

export function Countdown({ target }) {
  const items = useCountdown(target);

  return (
    <div className="countdown" aria-label="Wedding countdown">
      {items.map(([label, value]) => (
        <div className="countdown__item" key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
