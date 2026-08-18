import { useEffect, useState } from "react";
import { getWeddingMessages } from "../../lib/messagesApi";

export function WishesAdmin() {
  const [wishes, setWishes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const loadWishes = async () => {
    setStatus("loading");
    setError("");

    try {
      const messages = await getWeddingMessages();
      setWishes(messages);
      setStatus("ready");
    } catch (requestError) {
      setWishes([]);
      setStatus("error");
      setError(requestError.message || "Could not load messages.");
    }
  };

  useEffect(() => {
    loadWishes();
  }, []);

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime()) ? date : parsedDate.toLocaleString();
  };

  return (
    <main className="admin-page">
      <section className="admin-panel" aria-labelledby="admin-title">
        <span className="section-kicker">PRIVATE</span>
        <h1 id="admin-title">Wedding Wishes</h1>
        <p>Messages sent from the invitation form.</p>

        <div className="admin-actions">
          <button className="rsvp-button" type="button" onClick={loadWishes}>
            REFRESH
          </button>
        </div>

        {status === "loading" ? <p>Loading messages...</p> : null}
        {status === "error" && <p className="admin-error">{error}</p>}

        <div className="admin-wishes">
          {status === "loading" || status === "error" ? null : wishes.length === 0 ? (
            <p>No wishes yet.</p>
          ) : (
            wishes.map((wish) => (
              <article className="admin-wish" key={wish.id}>
                <time dateTime={wish.created_at}>
                  {formatDate(wish.created_at)}
                </time>
                <strong>{wish.name}</strong>
                <p>{wish.message}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
