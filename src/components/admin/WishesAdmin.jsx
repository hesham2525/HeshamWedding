import { useEffect, useState } from "react";

const tokenStorageKey = "wedding-wishes-admin-token";

export function WishesAdmin() {
  const [token, setToken] = useState(
    () => window.sessionStorage.getItem(tokenStorageKey) || ""
  );
  const [tokenInput, setTokenInput] = useState(token);
  const [wishes, setWishes] = useState([]);
  const [status, setStatus] = useState(token ? "loading" : "locked");
  const [error, setError] = useState("");

  const loadWishes = async (nextToken = token) => {
    if (!nextToken) {
      setStatus("locked");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/wishes", {
        headers: {
          Authorization: `Bearer ${nextToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("The admin token is not valid.");
      }

      const data = await response.json();
      setWishes(Array.isArray(data.wishes) ? data.wishes : []);
      setStatus("ready");
    } catch (requestError) {
      setWishes([]);
      setStatus("locked");
      setError(requestError.message || "Could not load wishes.");
    }
  };

  useEffect(() => {
    if (token) loadWishes(token);
  }, []);

  const handleUnlock = (event) => {
    event.preventDefault();

    const nextToken = tokenInput.trim();
    setToken(nextToken);
    window.sessionStorage.setItem(tokenStorageKey, nextToken);
    loadWishes(nextToken);
  };

  const handleLock = () => {
    setToken("");
    setTokenInput("");
    setWishes([]);
    setStatus("locked");
    window.sessionStorage.removeItem(tokenStorageKey);
  };

  return (
    <main className="admin-page">
      <section className="admin-panel" aria-labelledby="admin-title">
        <span className="section-kicker">PRIVATE</span>
        <h1 id="admin-title">Wedding Wishes</h1>
        <p>Only someone with the admin token can read these messages.</p>

        {status === "locked" ? (
          <form className="admin-token-form" onSubmit={handleUnlock}>
            <label>
              <span>Admin token</span>
              <input
                type="password"
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                placeholder="Enter your private token"
              />
            </label>
            <button className="rsvp-button" type="submit" disabled={!tokenInput.trim()}>
              OPEN MESSAGES
            </button>
            {error && <p className="admin-error">{error}</p>}
          </form>
        ) : (
          <>
            <div className="admin-actions">
              <button className="rsvp-button" type="button" onClick={() => loadWishes()}>
                REFRESH
              </button>
              <button
                className="rsvp-button rsvp-button--secondary"
                type="button"
                onClick={handleLock}
              >
                LOCK
              </button>
            </div>

            {status === "loading" ? <p>Loading messages...</p> : null}

            <div className="admin-wishes">
              {status === "loading" ? null : wishes.length === 0 ? (
                <p>No wishes yet.</p>
              ) : (
                wishes.map((wish) => (
                  <article className="admin-wish" key={wish.id}>
                    <time dateTime={wish.created_at}>
                      {new Date(wish.created_at).toLocaleString()}
                    </time>
                    <strong>{wish.name}</strong>
                    <p>{wish.message}</p>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
