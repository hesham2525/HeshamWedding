import { useEffect, useMemo, useRef, useState } from "react";
import { useCountdown } from "../../hooks/useCountdown";

const roseCount = 110;
const fireworkCount = 9;
const sparksPerFirework = 22;

function createCelebrationItem(index, total, type) {
  const progress = index / Math.max(total - 1, 1);
  const side = index % 2 === 0 ? -1 : 1;

  if (type === "firework") {
    return {
      id: `countdown-firework-${index}`,
      delay: 0.25 + index * 0.62,
      x: `${14 + Math.random() * 72}vw`,
      y: `${14 + Math.random() * 36}vh`,
      color: ["#f4d49a", "#ff8fab", "#9ed8ff", "#cdb6e8", "#fff0c6"][
        index % 5
      ],
    };
  }

  return {
    id: `countdown-rose-${index}`,
    delay: progress * 3.4 + Math.random() * 0.9,
    duration: 5.2 + Math.random() * 3.3,
    x: `${Math.random() * 100}vw`,
    drift: `${(Math.random() - 0.5) * 34}vw`,
    rotate: `${side * (120 + Math.random() * 420)}deg`,
    scale: 0.58 + Math.random() * 1.25,
    kind: index % 5 === 0 ? "leaf" : index % 7 === 0 ? "bloom" : "petal",
  };
}

export function Countdown({ target }) {
  const items = useCountdown(target);
  const wasCompleteRef = useRef(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const isComplete = items.every(([, value]) => value === 0);
  const roses = useMemo(
    () =>
      Array.from({ length: roseCount }, (_, index) =>
        createCelebrationItem(index, roseCount, "rose")
      ),
    []
  );
  const fireworks = useMemo(
    () =>
      Array.from({ length: fireworkCount }, (_, index) =>
        createCelebrationItem(index, fireworkCount, "firework")
      ),
    []
  );

  useEffect(() => {
    if (!isComplete) {
      wasCompleteRef.current = false;
      setShowCelebration(false);
      return undefined;
    }

    if (wasCompleteRef.current) return undefined;

    wasCompleteRef.current = true;
    setShowCelebration(true);

    return undefined;
  }, [isComplete]);

  return (
    <>
      <div className="countdown" aria-label="Wedding countdown">
        {items.map(([label, value]) => (
          <div className="countdown__item" key={label}>
            <strong>{String(value).padStart(2, "0")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {showCelebration ? (
        <div className="countdown-celebration" aria-hidden="true">
          <div className="countdown-celebration__fireworks">
            {fireworks.map((firework) => (
              <div
                className="countdown-firework"
                key={firework.id}
                style={{
                  "--delay": `${firework.delay}s`,
                  "--x": firework.x,
                  "--y": firework.y,
                  "--firework-color": firework.color,
                }}
              >
                {Array.from({ length: sparksPerFirework }, (_, index) => (
                  <span
                    className="countdown-firework__spark"
                    key={`${firework.id}-spark-${index}`}
                    style={{
                      "--angle": `${(360 / sparksPerFirework) * index}deg`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          {roses.map((rose) => (
            <span
              className={`countdown-rose countdown-rose--${rose.kind}`}
              key={rose.id}
              style={{
                "--delay": `${rose.delay}s`,
                "--duration": `${rose.duration}s`,
                "--x": rose.x,
                "--drift": rose.drift,
                "--rotate": rose.rotate,
                "--scale": rose.scale,
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
