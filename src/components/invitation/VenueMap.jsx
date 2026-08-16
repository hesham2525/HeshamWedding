import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { weddingData } from "../../data/weddingData";

const butterflyCount = 56;
const bloomCount = 64;

function createMapBurstItem(index, total, type) {
  const side = index % 2 === 0 ? -1 : 1;
  const progress = index / Math.max(total - 1, 1);
  const startY = type === "butterfly" ? 80 : 120;

  return {
    id: `${type}-${index}`,
    delay: Math.random() * 1.35 + progress * 0.75,
    duration:
      type === "butterfly"
        ? 4.1 + Math.random() * 2.1
        : 3.5 + Math.random() * 1.8,
    x: side * (60 + Math.random() * 430) + (Math.random() - 0.5) * 120,
    y: -150 - Math.random() * 500,
    startX: side * (Math.random() * 90),
    startY,
    drift: (Math.random() - 0.5) * 170,
    rotate: side * (80 + Math.random() * 280),
    scale:
      type === "butterfly"
        ? 0.42 + Math.random() * 0.95
        : 0.58 + Math.random() * 1.2,
    kind: index % 5 === 0 ? "leaf" : "petal",
  };
}

export function VenueMap() {
  const sectionRef = useRef(null);
  const burstRef = useRef(null);
  const butterflies = useMemo(
    () =>
      Array.from({ length: butterflyCount }, (_, index) =>
        createMapBurstItem(index, butterflyCount, "butterfly")
      ),
    []
  );
  const blooms = useMemo(
    () =>
      Array.from({ length: bloomCount }, (_, index) =>
        createMapBurstItem(index, bloomCount, "bloom")
      ),
    []
  );

  useEffect(() => {
    if (!sectionRef.current || !burstRef.current) return undefined;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return undefined;

    let ctx;

    const playBurst = () => {
      const butterflyElements = gsap.utils.toArray(
        ".venue-burst__butterfly",
        burstRef.current
      );
      const bloomElements = gsap.utils.toArray(
        ".venue-burst__bloom",
        burstRef.current
      );

      ctx = gsap.context(() => {
        butterflyElements.forEach((element, index) => {
          const x = Number(element.dataset.x);
          const y = Number(element.dataset.y);
          const startX = Number(element.dataset.startX);
          const startY = Number(element.dataset.startY);
          const drift = Number(element.dataset.drift);
          const rotate = Number(element.dataset.rotate);
          const scale = Number(element.dataset.scale);
          const duration = Number(element.dataset.duration);
          const delay = Number(element.dataset.delay);
          const visibleOpacity = index % 3 === 0 ? 0.74 : 0.94;

          gsap.fromTo(
            element,
            {
              opacity: 0,
              xPercent: -50,
              yPercent: -50,
              x: startX,
              y: startY,
              rotate: 0,
              scale: 0.12,
            },
            {
              delay,
              repeat: -1,
              repeatDelay: 0.9 + (index % 7) * 0.2,
              keyframes: [
                {
                  opacity: visibleOpacity,
                  x: x * 0.72,
                  y: y * 0.72,
                  rotate: rotate * 0.55,
                  scale,
                  duration: duration * 0.72,
                  ease: "power2.out",
                },
                {
                  opacity: 0.08,
                  x: x + drift,
                  y: y - 210,
                  rotate: rotate + (drift > 0 ? 42 : -42),
                  scale: scale * 0.84,
                  duration: 2.4,
                  ease: "sine.in",
                },
              ],
            }
          );
        });

        bloomElements.forEach((element, index) => {
          const x = Number(element.dataset.x);
          const y = Number(element.dataset.y);
          const startX = Number(element.dataset.startX);
          const startY = Number(element.dataset.startY);
          const drift = Number(element.dataset.drift);
          const rotate = Number(element.dataset.rotate);
          const scale = Number(element.dataset.scale);
          const duration = Number(element.dataset.duration);
          const delay = Number(element.dataset.delay);
          const visibleOpacity = element.dataset.kind === "leaf" ? 0.78 : 0.88;

          gsap.fromTo(
            element,
            {
              opacity: 0,
              xPercent: -50,
              yPercent: -50,
              x: startX,
              y: startY,
              rotate: 0,
              scale: 0.14,
            },
            {
              delay,
              repeat: -1,
              repeatDelay: 0.75 + (index % 8) * 0.18,
              keyframes: [
                {
                  opacity: visibleOpacity,
                  x: x * 0.72,
                  y: y * 0.72,
                  rotate: rotate * 0.58,
                  scale,
                  duration: duration * 0.7,
                  ease: "power1.out",
                },
                {
                  opacity: 0.08,
                  x: x + drift,
                  y: y - 175,
                  rotate: rotate + (drift > 0 ? 68 : -68),
                  scale: scale * 0.8,
                  duration: 2.05,
                  ease: "sine.in",
                },
              ],
            }
          );
        });
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        playBurst();
        observer.disconnect();
      },
      { threshold: 0.28 }
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <section
      className="content-section venue-map-section reveal"
      aria-labelledby="venue-map-title"
      ref={sectionRef}
    >
      <div className="venue-burst" ref={burstRef} aria-hidden="true">
        {butterflies.map((butterfly) => (
          <img
            className="venue-burst__butterfly"
            key={butterfly.id}
            src={weddingData.assets.butterfly}
            alt=""
            draggable="false"
            data-x={butterfly.x}
            data-y={butterfly.y}
            data-start-x={butterfly.startX}
            data-start-y={butterfly.startY}
            data-drift={butterfly.drift}
            data-rotate={butterfly.rotate}
            data-scale={butterfly.scale}
            data-duration={butterfly.duration}
            data-delay={butterfly.delay}
          />
        ))}
        {blooms.map((item) => (
          <span
            className={`venue-burst__bloom venue-burst__bloom--${item.kind}`}
            key={item.id}
            data-kind={item.kind}
            data-x={item.x}
            data-y={item.y}
            data-start-x={item.startX}
            data-start-y={item.startY}
            data-drift={item.drift}
            data-rotate={item.rotate}
            data-scale={item.scale}
            data-duration={item.duration}
            data-delay={item.delay}
          />
        ))}
      </div>
      <span className="section-kicker">LOCATION</span>
      <h3 id="venue-map-title">Find your way to us</h3>
      <p>{weddingData.venue} · {weddingData.city}</p>

      <a
        className="venue-map"
        href={weddingData.mapUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open map directions to ${weddingData.venue}`}
      >
        <div className="venue-map__art" aria-hidden="true">
          <span className="venue-map__road venue-map__road--one" />
          <span className="venue-map__road venue-map__road--two" />
          <span className="venue-map__road venue-map__road--three" />
          <span className="venue-map__pin" />
        </div>

        <div className="venue-map__details">
          <span>Wedding venue</span>
          <strong>{weddingData.venue}</strong>
          <p>{weddingData.city}</p>
          <em>Open directions</em>
        </div>
      </a>
    </section>
  );
}
