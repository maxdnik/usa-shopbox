// src/lib/ebayAuth.ts
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getEbayToken() {
  if (
    cachedToken &&
    Date.now() < cachedToken.expiresAt - 60_000 // 1 min margen
  ) {
    return cachedToken.token;
  }

  const clientId = process.env.EBAY_CLIENT_ID!;
  const clientSecret = process.env.EBAY_CLIENT_SECRET!;
  const scope =
    process.env.EBAY_SCOPE || "https://api.ebay.com/oauth/api_scope";

  if (!clientId || !clientSecret) {
    throw new Error("Faltan EBAY_CLIENT_ID o EBAY_CLIENT_SECRET en .env.local");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const res = await fetch(
    "https://api.ebay.com/identity/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Error al obtener token de eBay:", text);
    throw new Error(`eBay token error: ${res.status}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}
