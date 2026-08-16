import { weddingData } from "../../data/weddingData";

export function VenueMap() {
  return (
    <section className="content-section venue-map-section reveal" aria-labelledby="venue-map-title">
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
