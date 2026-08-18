const messagesApiUrl = "https://wedding-messages-api.hmwedding.workers.dev/messages";

export async function sendWeddingMessage({ name, message }) {
  const response = await fetch(messagesApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, message }),
  });

  if (!response.ok) {
    throw new Error(await getResponseError(response));
  }

  return response.json().catch(() => ({ ok: true }));
}

export async function getWeddingMessages() {
  const response = await fetch(messagesApiUrl);

  if (!response.ok) {
    throw new Error(await getResponseError(response));
  }

  const data = await response.json();
  const messages = Array.isArray(data)
    ? data
    : data.messages || data.wishes || [];

  return messages.map((message) => ({
    ...message,
    created_at: message.created_at || message.createdAt,
  }));
}

async function getResponseError(response) {
  try {
    const data = await response.json();
    return data?.error || data?.message || "Request failed.";
  } catch {
    return "Request failed.";
  }
}
