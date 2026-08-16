import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { weddingData } from "../../data/weddingData";

const butterfliesCount = 48;
const greeneryCount = 92;

function createBurstItem(index, total, type) {
  const side = index % 2 === 0 ? -1 : 1;
  const progress = index / Math.max(total - 1, 1);

  return {
    id: `${type}-${index}`,
    delay: Math.random() * 0.82 + progress * 0.12,
    duration: 2.4 + Math.random() * 1.8,
    rotate: side * (80 + Math.random() * 260),
    scale: type === "butterfly" ? 0.48 + Math.random() * 0.95 : 0.6 + Math.random() * 1.2,
    x: side * (45 + Math.random() * 460) + (Math.random() - 0.5) * 180,
    y: -180 - Math.random() * 620,
    drift: (Math.random() - 0.5) * 180,
    kind: index % 5 === 0 ? "leaf" : "petal",
  };
}

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
  const sectionRef = useRef(null);
  const burstRef = useRef(null);
  const hasPlayedRef = useRef(false);
  const butterflies = useMemo(
    () =>
      Array.from({ length: butterfliesCount }, (_, index) =>
        createBurstItem(index, butterfliesCount, "butterfly")
      ),
    []
  );
  const greenery = useMemo(
    () =>
      Array.from({ length: greeneryCount }, (_, index) =>
        createBurstItem(index, greeneryCount, "greenery")
      ),
    []
  );

  useEffect(() => {
    if (!sectionRef.current || !burstRef.current) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return undefined;

    const playBurst = () => {
      if (hasPlayedRef.current || !burstRef.current) return;
      hasPlayedRef.current = true;

      const butterflyElements = gsap.utils.toArray(
        ".rsvp-burst__butterfly",
        burstRef.current
      );
      const greeneryElements = gsap.utils.toArray(
        ".rsvp-burst__greenery",
        burstRef.current
      );

      butterflyElements.forEach((element, index) => {
        const x = Number(element.dataset.x);
        const y = Number(element.dataset.y);
        const drift = Number(element.dataset.drift);
        const rotate = Number(element.dataset.rotate);
        const scale = Number(element.dataset.scale);
        const duration = Number(element.dataset.duration);
        const delay = Number(element.dataset.delay);
        const visibleOpacity = index % 3 === 0 ? 0.72 : 0.92;

        gsap.fromTo(
          element,
          {
            opacity: 0,
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            rotate: 0,
            scale: 0.1,
          },
          {
            delay,
            keyframes: [
              {
                opacity: visibleOpacity,
                x: x * 0.78,
                y: y * 0.78,
                rotate: rotate * 0.62,
                scale,
                duration: duration * 0.66,
                ease: "power2.out",
              },
              {
                opacity: 0,
                x: x + drift,
                y: y - 190,
                rotate: rotate + (drift > 0 ? 42 : -42),
                scale: scale * 0.78,
                duration: 1.25,
                ease: "sine.in",
              },
            ],
          }
        );
      });

      greeneryElements.forEach((element) => {
        const x = Number(element.dataset.x);
        const y = Number(element.dataset.y);
        const drift = Number(element.dataset.drift);
        const rotate = Number(element.dataset.rotate);
        const scale = Number(element.dataset.scale);
        const duration = Number(element.dataset.duration);
        const delay = Number(element.dataset.delay);
        const visibleOpacity = element.dataset.kind === "leaf" ? 0.78 : 0.86;

        gsap.fromTo(
          element,
          {
            opacity: 0,
            xPercent: -50,
            yPercent: -50,
            x: 0,
            y: 0,
            rotate: 0,
            scale: 0.15,
          },
          {
            delay,
            keyframes: [
              {
                opacity: visibleOpacity,
                x: x * 0.74,
                y: y * 0.74,
                rotate: rotate * 0.58,
                scale,
                duration: duration * 0.62,
                ease: "power1.out",
              },
              {
                opacity: 0,
                x: x + drift,
                y: y - 150,
                rotate: rotate + (drift > 0 ? 70 : -70),
                scale: scale * 0.72,
                duration: 1.05,
                ease: "sine.in",
              },
            ],
          }
        );
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        playBurst();
        observer.disconnect();
      },
      { threshold: 0.34 }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  if (!weddingData.rsvp.enabled) return null;

  const rsvpUrl = getRsvpUrl();

  return (
    <section
      className="content-section rsvp"
      aria-labelledby="rsvp-title"
      ref={sectionRef}
    >
      <div className="rsvp-burst" ref={burstRef} aria-hidden="true">
        {butterflies.map((butterfly) => (
          <img
            className="rsvp-burst__butterfly"
            key={butterfly.id}
            src={weddingData.assets.butterfly}
            alt=""
            draggable="false"
            data-x={butterfly.x}
            data-y={butterfly.y}
            data-drift={butterfly.drift}
            data-rotate={butterfly.rotate}
            data-scale={butterfly.scale}
            data-duration={butterfly.duration}
            data-delay={butterfly.delay}
          />
        ))}
        {greenery.map((item) => (
          <span
            className={`rsvp-burst__greenery rsvp-burst__greenery--${item.kind}`}
            key={item.id}
            data-kind={item.kind}
            data-x={item.x}
            data-y={item.y}
            data-drift={item.drift}
            data-rotate={item.rotate}
            data-scale={item.scale}
            data-duration={item.duration}
            data-delay={item.delay}
          />
        ))}
      </div>
      <span className="section-kicker">RSVP</span>
      <h3 id="rsvp-title">Will you celebrate with us?</h3>
      <p>We would love to know if you can join us for this evening.</p>
      {rsvpUrl ? (
        <a className="rsvp-button" href={rsvpUrl} target="_blank" rel="noreferrer">
          YES, I'LL BE THERE
        </a>
      ) : (
        <button className="rsvp-button" type="button" disabled>
          RSVP COMING SOON
        </button>
      )}
    </section>
  );
}
