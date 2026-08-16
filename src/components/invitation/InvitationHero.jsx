import { weddingData } from "../../data/weddingData";

export function InvitationHero({ musicEnabled, onToggleMusic, hasMusic }) {
  const scrollToDetails = (event) => {
    const target = document.getElementById("details");

    if (!target) return;

    event.preventDefault();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const start = window.scrollY;
    const targetTop =
      target.getBoundingClientRect().top + window.scrollY - 18;
    const distance = targetTop - start;
    const duration = 2800;
    let startedAt;

    if (reducedMotion) {
      window.scrollTo({ top: targetTop, behavior: "auto" });
      return;
    }

    const easeInOutQuint = (progress) =>
      progress < 0.5
        ? 16 * progress * progress * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 5) / 2;

    const step = (time) => {
      if (!startedAt) startedAt = time;

      const elapsed = time - startedAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutQuint(progress);

      window.scrollTo(0, start + distance * eased);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        window.history.replaceState(null, "", "#details");
      }
    };

    window.requestAnimationFrame(step);
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
        <a className="pill-button" href="#details" onClick={scrollToDetails}>
          View invitation
        </a>
      </div>
    </section>
  );
}
