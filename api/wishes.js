const tableName = "wedding_wishes";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function getRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 10000) {
        reject(new Error("Request body is too large."));
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
  });
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) {
    throw new Error("Supabase environment variables are missing.");
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Supabase request failed.");
  }

  if (response.status === 204) return null;

  return response.json();
}

async function createWish(request, response) {
  const body = await getRequestBody(request);
  const name = String(body.name || "").trim();
  const message = String(body.message || "").trim();

  if (!name) {
    sendJson(response, 400, { error: "Name is required." });
    return;
  }

  if (!message) {
    sendJson(response, 400, { error: "Message is required." });
    return;
  }

  if (name.length > 60) {
    sendJson(response, 400, { error: "Name is too long." });
    return;
  }

  if (message.length > 500) {
    sendJson(response, 400, { error: "Message is too long." });
    return;
  }

  await supabaseRequest(tableName, {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ name, message }),
  });

  sendJson(response, 201, { ok: true });
}

async function listWishes(request, response) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    sendJson(response, 401, { error: "Unauthorized." });
    return;
  }

  const wishes = await supabaseRequest(
    `${tableName}?select=id,name,message,created_at&order=created_at.desc&limit=200`
  );

  sendJson(response, 200, { wishes });
}

export default async function handler(request, response) {
  try {
    if (request.method === "POST") {
      await createWish(request, response);
      return;
    }

    if (request.method === "GET") {
      await listWishes(request, response);
      return;
    }

    response.setHeader("Allow", "GET, POST");
    sendJson(response, 405, { error: "Method not allowed." });
  } catch (error) {
    sendJson(response, 500, {
      error: error.message || "Something went wrong.",
    });
  }
}
