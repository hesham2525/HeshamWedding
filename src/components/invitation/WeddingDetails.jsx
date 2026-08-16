import { weddingData } from "../../data/weddingData";

export function WeddingDetails() {
  return (
    <section className="details content-section" id="details" aria-label="Wedding details">
      <article className="detail-card reveal">
        <span aria-hidden="true">I</span>
        <p className="detail-card__label">TIMING</p>
        <h4>{weddingData.dateParts.day}</h4>
        <p>{weddingData.dateParts.date}</p>
        <p>Reception starts</p>
        <strong>{weddingData.receptionTime}</strong>
      </article>

      <article className="detail-card reveal">
        <span aria-hidden="true">II</span>
        <p className="detail-card__label">LOCATION</p>
        <h4>{weddingData.venue}</h4>
        <p>{weddingData.city}</p>
        <a href={weddingData.mapUrl} target="_blank" rel="noreferrer">
          OPEN MAP
        </a>
      </article>

      <article className="detail-card reveal">
        <span aria-hidden="true">III</span>
        <p className="detail-card__label">DRESS CODE</p>
        <h4>{weddingData.dressCode}</h4>
        <p>Come dressed for an elegant evening.</p>
      </article>
    </section>
  );
}
