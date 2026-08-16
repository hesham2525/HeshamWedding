import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Countdown } from "./Countdown";
import { InvitationHero } from "./InvitationHero";
import { RSVP } from "./RSVP";
import { VenueMap } from "./VenueMap";
import { WeddingDetails } from "./WeddingDetails";
import { weddingData } from "../../data/weddingData";

export function WeddingInvitation({ hasMusic, musicEnabled, onToggleMusic }) {
  const invitationRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion || !invitationRef.current) return undefined;

    const elements = gsap.utils.toArray(".reveal", invitationRef.current);
    gsap.set(elements, { opacity: 0, y: 26 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power2.out",
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <article className="invitation" ref={invitationRef}>
      <InvitationHero
        hasMusic={hasMusic}
        musicEnabled={musicEnabled}
        onToggleMusic={onToggleMusic}
      />

      <div className="paper">
        <section
          className="content-section intro-section reveal"
          aria-labelledby="welcome-title"
        >
          <img
            className="butterfly butterfly--intro"
            src={weddingData.assets.butterfly}
            alt=""
            aria-hidden="true"
          />
          <span className="section-kicker">SAVE THE DATE</span>
          <h3 id="welcome-title">A day to remember</h3>
          <p>{weddingData.quote}</p>
          <Countdown target={weddingData.weddingDate} />
        </section>

        <WeddingDetails />

        <section className="content-section story reveal" aria-labelledby="story-title">
          <span className="section-kicker">OUR CELEBRATION</span>
          <h3 id="story-title">One door. One promise. One beginning.</h3>
          <p>{weddingData.celebration}</p>
        </section>

        <VenueMap />
        <RSVP />

        <footer>
          <div className="footer-mark">{weddingData.monogram}</div>
          <p>See you there.</p>
        </footer>
      </div>
    </article>
  );
}
