import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { weddingData } from "../../data/weddingData";

const openingAssets = [
  weddingData.assets.outerScene,
  weddingData.assets.leftDoor,
  weddingData.assets.rightDoor,
  weddingData.assets.insideGarden,
  weddingData.assets.butterfly,
];

const butterflyBurst = Array.from({ length: 72 }, (_, index) => {
  const side = index % 2 === 0 ? -1 : 1;
  const spread = 45 + Math.random() * 270;

  return {
    id: `butterfly-burst-${index}`,
    x: side * spread + (Math.random() - 0.5) * 110,
    y: -90 - Math.random() * 610,
    rotate: side * (18 + Math.random() * 72),
    scale: 0.32 + Math.random() * 0.72,
    duration: 1.45 + Math.random() * 1.35,
    delay: Math.random() * 0.72,
  };
});

const petalBurst = Array.from({ length: 54 }, (_, index) => {
  const side = index % 2 === 0 ? -1 : 1;

  return {
    id: `petal-burst-${index}`,
    kind: index % 4 === 0 ? "leaf" : "petal",
    x: side * (25 + Math.random() * 250) + (Math.random() - 0.5) * 140,
    y: -70 - Math.random() * 560,
    rotate: side * (80 + Math.random() * 260),
    scale: 0.45 + Math.random() * 0.9,
    duration: 1.6 + Math.random() * 1.5,
    delay: Math.random() * 0.9,
  };
});

function preloadImages(paths) {
  return Promise.all(
    paths.map(
      (path) =>
        new Promise((resolve) => {
          const image = new Image();
          image.onload = resolve;
          image.onerror = resolve;
          image.src = path;
        })
    )
  );
}

export function DoorScene({ onComplete, onKnock, onDoorOpenStart }) {
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  const screenRef = useRef(null);
  const sceneRef = useRef(null);
  const leftDoorRef = useRef(null);
  const rightDoorRef = useRef(null);
  const portalRef = useRef(null);
  const promptRef = useRef(null);
  const butterflyBurstRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    preloadImages(openingAssets).then(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading || !sceneRef.current) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".opening-copy > *",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.16, ease: "power2.out" }
      );

      gsap.to(".enter-prompt__ring", {
        scale: 1.5,
        opacity: 0.15,
        duration: 1.35,
        repeat: -1,
        ease: "sine.inOut",
      });
    }, sceneRef);

    return () => ctx.revert();
  }, [loading]);

  useEffect(() => {
    document.body.classList.add("is-door-active");

    return () => {
      document.body.classList.remove("is-door-active");
    };
  }, []);

  const openDoor = () => {
    if (opening || loading) return;

    setOpening(true);
    onKnock?.();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      gsap.to(screenRef.current, {
        opacity: 0,
        duration: 0.28,
        onComplete,
      });
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete,
    });

    tl.to(sceneRef.current, {
      x: -2,
      duration: 0.05,
      repeat: 5,
      yoyo: true,
      ease: "none",
    })
      .call(() => onDoorOpenStart?.(), undefined, 0.9)
      .to(
        promptRef.current,
        {
          opacity: 0,
          y: 16,
          duration: 0.35,
          pointerEvents: "none",
        },
        0.12
      )
      .to(
        portalRef.current,
        {
          opacity: 1,
          filter: "brightness(1.18) saturate(1.1)",
          duration: 0.8,
        },
        0.72
      )
      .to(
        ".portal-glow",
        {
          opacity: 0.92,
          scale: 1.25,
          duration: 1.35,
        },
        0.82
      )
      .call(
        () => {
          const butterflies = gsap.utils.toArray(
            ".butterfly-burst__item",
            butterflyBurstRef.current
          );
          const petals = gsap.utils.toArray(
            ".petal-burst__item",
            butterflyBurstRef.current
          );

          gsap.fromTo(
            butterflies,
            {
              opacity: 0,
              xPercent: -50,
              yPercent: -50,
              x: 0,
              y: 0,
              scale: 0.08,
              rotate: 0,
            },
            {
              opacity: (index) => (index % 3 === 0 ? 0.72 : 0.9),
              xPercent: -50,
              yPercent: -50,
              x: (index, element) => Number(element.dataset.x),
              y: (index, element) => Number(element.dataset.y),
              scale: (index, element) => Number(element.dataset.scale),
              rotate: (index, element) => Number(element.dataset.rotate),
              duration: (index, element) => Number(element.dataset.duration),
              delay: (index, element) => Number(element.dataset.delay),
              ease: "power2.out",
              stagger: {
                each: 0.012,
                from: "random",
              },
            }
          );

          gsap.to(butterflies, {
            opacity: 0,
            duration: 0.42,
            delay: 1.65,
            stagger: {
              each: 0.006,
              from: "random",
            },
            ease: "sine.out",
          });

          gsap.fromTo(
            petals,
            {
              opacity: 0,
              xPercent: -50,
              yPercent: -50,
              x: 0,
              y: 0,
              scale: 0.12,
              rotate: 0,
            },
            {
              opacity: (index, element) =>
                element.dataset.kind === "leaf" ? 0.66 : 0.78,
              xPercent: -50,
              yPercent: -50,
              x: (index, element) => Number(element.dataset.x),
              y: (index, element) => Number(element.dataset.y),
              scale: (index, element) => Number(element.dataset.scale),
              rotate: (index, element) => Number(element.dataset.rotate),
              duration: (index, element) => Number(element.dataset.duration),
              delay: (index, element) => Number(element.dataset.delay),
              ease: "power1.out",
              stagger: {
                each: 0.008,
                from: "random",
              },
            }
          );

          gsap.to(petals, {
            opacity: 0,
            duration: 0.5,
            delay: 1.82,
            stagger: {
              each: 0.005,
              from: "random",
            },
            ease: "sine.out",
          });
        },
        undefined,
        1.02
      )
      .to(
        leftDoorRef.current,
        {
          rotateY: -108,
          duration: 1.65,
          transformOrigin: "left center",
        },
        0.9
      )
      .to(
        rightDoorRef.current,
        {
          rotateY: 108,
          duration: 1.65,
          transformOrigin: "right center",
        },
        0.9
      )
      .to(
        ".portal__garden",
        {
          scale: 1.08,
          duration: 1.9,
          ease: "power2.out",
        },
        1.08
      )
      .to(
        sceneRef.current,
        {
          scale: 2.32,
          yPercent: 8,
          duration: 1.58,
          ease: "power2.inOut",
        },
        2.03
      )
      .to(
        screenRef.current,
        {
          opacity: 0,
          filter: "blur(8px)",
          duration: 0.72,
          ease: "power2.out",
        },
        3.06
      );
  };

  return (
    <section
      className="door-screen"
      aria-label="Open wedding invitation"
      ref={screenRef}
      onClick={openDoor}
    >
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      {loading ? (
        <div className="loader" role="status" aria-live="polite">
          <strong>{weddingData.monogram}</strong>
          <span>Preparing your invitation...</span>
        </div>
      ) : (
        <div className="scene-shell">
          <div className="scene" ref={sceneRef}>
            <img
              className="scene__background"
              src={weddingData.assets.outerScene}
              alt=""
              draggable="false"
            />

            <div className="opening-copy">
              <p>{weddingData.eyebrow}</p>
              <h1>{weddingData.couple}</h1>
              <p>{weddingData.intro}</p>
            </div>

            <div className="portal" ref={portalRef}>
              <div className="portal-glow" />
              <img
                className="portal__garden"
                src={weddingData.assets.insideGarden}
                alt=""
                draggable="false"
              />
            </div>

            <div className="doors" aria-hidden="true">
              <div className="door door--left" ref={leftDoorRef}>
                <img src={weddingData.assets.leftDoor} alt="" draggable="false" />
                <span className="door__shine" />
              </div>

              <div className="door door--right" ref={rightDoorRef}>
                <img src={weddingData.assets.rightDoor} alt="" draggable="false" />
                <span className="door__shine" />
              </div>
            </div>

            <div className="butterfly-burst" ref={butterflyBurstRef} aria-hidden="true">
              {butterflyBurst.map((butterfly) => (
                <img
                  className="butterfly-burst__item"
                  key={butterfly.id}
                  src={weddingData.assets.butterfly}
                  alt=""
                  draggable="false"
                  data-x={butterfly.x}
                  data-y={butterfly.y}
                  data-rotate={butterfly.rotate}
                  data-scale={butterfly.scale}
                  data-duration={butterfly.duration}
                  data-delay={butterfly.delay}
                />
              ))}
              {petalBurst.map((petal) => (
                <span
                  className={`petal-burst__item petal-burst__item--${petal.kind}`}
                  key={petal.id}
                  data-kind={petal.kind}
                  data-x={petal.x}
                  data-y={petal.y}
                  data-rotate={petal.rotate}
                  data-scale={petal.scale}
                  data-duration={petal.duration}
                  data-delay={petal.delay}
                />
              ))}
            </div>

            <button
              className="enter-prompt"
              type="button"
              ref={promptRef}
              disabled={opening}
              onClick={(event) => {
                event.stopPropagation();
                openDoor();
              }}
            >
              <span className="enter-prompt__ring" />
              <span className="enter-prompt__label">KNOCK TO ENTER</span>
              <span className="enter-prompt__sub">Tap the door</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
