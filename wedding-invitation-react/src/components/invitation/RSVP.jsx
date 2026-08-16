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
  if (!weddingData.rsvp.enabled) return null;

  const rsvpUrl = getRsvpUrl();

  return (
    <section className="content-section rsvp" aria-labelledby="rsvp-title">
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
