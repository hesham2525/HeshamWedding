import { useEffect, useRef, useState } from "react";
import { weddingData } from "../../data/weddingData";

function getRsvpUrl() {
  const { rsvp } = weddingData;

  if (!rsvp.enabled) return "";
  if (rsvp.url) return rsvp.url;
  if (rsvp.type === "whatsapp" && rsvp.phone) {
    return `https://wa.me/${rsvp.phone}?text=${encodeURIComponent(rsvp.message)}`;
  }

  return "";
}

export function RSVP() {
  const canvasRef = useRef(null);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const rsvpUrl = getRsvpUrl();
  const canSubmitWish = Boolean(guestName.trim() && message.trim());

  useEffect(() => {
    const canvas = canvasRef.current;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!canvas || reducedMotion) return undefined;

    const context = canvas.getContext("2d");
    const colors = [
      "#f4d49a",
      "#fff0c6",
      "#e8a69a",
      "#cdb6e8",
      "#9ed8ff",
      "#bfe089",
      "#ffb7d5",
      "#f9a857",
    ];
    const rockets = [];
    const sparks = [];
    let animationFrame = 0;
    let lastLaunch = 0;
    let launchIndex = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const randomBetween = (min, max) => min + Math.random() * (max - min);

    const launchRocket = () => {
      const launchPattern = [
        { start: 0.34, target: 0.18 },
        { start: 0.66, target: 0.82 },
        { start: 0.5, target: 0.5 },
        { start: 0.4, target: 0.36 },
        { start: 0.6, target: 0.64 },
        { start: 0.46, target: 0.26 },
        { start: 0.54, target: 0.74 },
      ];
      const pattern = launchPattern[launchIndex % launchPattern.length];
      launchIndex += 1;

      const startX = width * pattern.start + randomBetween(-30, 30);
      const targetX = width * pattern.target + randomBetween(-48, 48);
      const targetY = randomBetween(height * 0.08, height * 0.44);

      rockets.push({
        x: startX,
        y: height + 20,
        targetX,
        targetY,
        vx: (targetX - startX) * 0.0052,
        vy: randomBetween(-5.25, -4.25),
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
      });
    };

    const explode = (rocket) => {
      const count = Math.floor(randomBetween(56, 84));

      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + randomBetween(-0.05, 0.05);
        const speed = randomBetween(1.05, 3.6);
        const color =
          index % 9 === 0
            ? "#fff8df"
            : colors[Math.floor(Math.random() * colors.length)];

        sparks.push({
          x: rocket.x,
          y: rocket.y,
          previousX: rocket.x,
          previousY: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: randomBetween(0.015, 0.038),
          friction: randomBetween(0.978, 0.989),
          alpha: randomBetween(0.62, 0.94),
          decay: randomBetween(0.0048, 0.009),
          size: randomBetween(1, 2.35),
          color,
        });
      }
    };

    const drawGlow = (x, y, radius, color, alpha) => {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.32, color);
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      context.save();
      context.globalAlpha = alpha;
      context.globalCompositeOperation = "lighter";
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.restore();
    };

    const tick = (time) => {
      context.globalCompositeOperation = "source-over";
      context.fillStyle = "rgba(60, 41, 36, 0.28)";
      context.fillRect(0, 0, width, height);

      if (time - lastLaunch > randomBetween(620, 1100)) {
        launchRocket();
        if (Math.random() > 0.52) {
          launchRocket();
        }
        lastLaunch = time;
      }

      for (let index = rockets.length - 1; index >= 0; index -= 1) {
        const rocket = rockets[index];

        rocket.x += rocket.vx;
        rocket.y += rocket.vy;
        rocket.vy += 0.015;
        rocket.life -= 0.004;

        context.save();
        context.globalCompositeOperation = "lighter";
        context.strokeStyle = rocket.color;
        context.globalAlpha = 0.58;
        context.lineWidth = 1.25;
        context.beginPath();
        context.moveTo(rocket.x, rocket.y + 14);
        context.lineTo(rocket.x, rocket.y);
        context.stroke();
        context.restore();

        drawGlow(rocket.x, rocket.y, 12, rocket.color, 0.24);

        if (rocket.y <= rocket.targetY || rocket.life <= 0) {
          explode(rocket);
          rockets.splice(index, 1);
        }
      }

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index];

        spark.previousX = spark.x;
        spark.previousY = spark.y;
        spark.vx *= spark.friction;
        spark.vy = spark.vy * spark.friction + spark.gravity;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.alpha -= spark.decay;

        context.save();
        context.globalCompositeOperation = "lighter";
        context.globalAlpha = Math.max(spark.alpha, 0);
        context.strokeStyle = spark.color;
        context.lineWidth = spark.size;
        context.beginPath();
        context.moveTo(spark.previousX, spark.previousY);
        context.lineTo(spark.x, spark.y);
        context.stroke();
        context.restore();

        if (spark.alpha <= 0) {
          sparks.splice(index, 1);
        }
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    resize();
    launchRocket();
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (!weddingData.rsvp.enabled) return null;

  const handleSubmitWish = async (event) => {
    event.preventDefault();

    if (!canSubmitWish) return;

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: guestName.trim(),
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        let requestError = "حصلت مشكلة في إرسال التهنئة. جرّب مرة تانية.";

        try {
          const data = await response.json();
          if (data?.error) requestError = data.error;
        } catch {
          // Keep the friendly fallback when the server does not return JSON.
        }

        throw new Error(requestError);
      }

      setGuestName("");
      setMessage("");
      setStatus("sent");
    } catch (requestError) {
      setErrorMessage(
        requestError.message || "حصلت مشكلة في إرسال التهنئة. جرّب مرة تانية."
      );
      setStatus("error");
    }
  };

  return (
    <section className="content-section rsvp" aria-labelledby="rsvp-title">
      <canvas className="wish-fireworks" ref={canvasRef} aria-hidden="true" />
      <span className="section-kicker">WISHES</span>
      <h3 id="rsvp-title">Send us your warm wishes</h3>
      <p>Leave a private note for the bride and groom.</p>

      <form className="wish-form" onSubmit={handleSubmitWish}>
        <div className="wish-form__fields">
          <label>
            <span>Your name</span>
            <input
              type="text"
              value={guestName}
              onChange={(event) => {
                setGuestName(event.target.value);
                setStatus("idle");
                setErrorMessage("");
              }}
              maxLength="60"
              placeholder="Write your name"
            />
          </label>

          <label>
            <span>Your wish</span>
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setStatus("idle");
                setErrorMessage("");
              }}
              maxLength="500"
              rows="4"
              placeholder="Write a beautiful message..."
            />
          </label>
        </div>

        <button
          className="rsvp-button"
          type="submit"
          disabled={!canSubmitWish || status === "sending"}
        >
          {status === "sending" ? "SENDING..." : "SEND YOUR WISH"}
        </button>

        {status === "sent" && (
          <p className="wish-form__thanks">Thank you for your beautiful wish.</p>
        )}
        {status === "error" && (
          <p className="wish-form__error">{errorMessage}</p>
        )}
      </form>

      {rsvpUrl ? (
        <a
          className="rsvp-button rsvp-button--secondary"
          href={rsvpUrl}
          target="_blank"
          rel="noreferrer"
        >
          YES, I'LL BE THERE
        </a>
      ) : null}
    </section>
  );
}
