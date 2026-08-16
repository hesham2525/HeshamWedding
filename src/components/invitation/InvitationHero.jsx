import { weddingData } from "../../data/weddingData";

export function InvitationHero({ musicEnabled, onToggleMusic, hasMusic }) {
  const scrollToDetails = (event) => {
    const target = document.getElementById("welcome");

    if (!target) return;

    event.preventDefault();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    target.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.replaceState(null, "", "#welcome");
  };

  return (
    <section className="invitation-hero" aria-labelledby="invitation-title">
      <div className="invitation-hero__image" />
      <div className="invitation-hero__overlay" />
      <img
        className="butterfly butterfly--hero"
        src={weddingData.assets.butterfly}
        alt=""
        aria-hidden="true"
      />

      {hasMusic && (
        <button
          className="music-toggle"
          type="button"
          onClick={onToggleMusic}
          aria-pressed={musicEnabled}
        >
          {musicEnabled ? "♪ ON" : "♪ OFF"}
        </button>
      )}

      <div className="invitation-hero__content">
        <span className="tiny-kicker">WE ARE GETTING MARRIED</span>
        <h2 id="invitation-title">
          {weddingData.groom}
          <span>&</span>
          {weddingData.bride}
        </h2>
        <div className="ornament">✦</div>
        <p>{weddingData.dateLabel}</p>
        <a className="pill-button" href="#welcome" onClick={scrollToDetails}>
          View invitation
        </a>
      </div>
    </section>
  );
}
