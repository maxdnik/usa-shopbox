// lib/ebay.ts
// Helper para manejar el token de eBay

let ebayTokenCache: {
  token: string | null;
  expiresAt: number; // timestamp en ms
} = {
  token: null,
  expiresAt: 0,
};

export async function getEbayAccessToken(): Promise<string> {
  // Si ya tenemos token y no está por expirar, lo reutilizamos
  const now = Date.now();
  if (ebayTokenCache.token && now < ebayTokenCache.expiresAt - 60_000) {
    return ebayTokenCache.token;
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("EBAY_CLIENT_ID o EBAY_CLIENT_SECRET no configurados");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenUrl = "https://api.ebay.com/identity/v1/oauth2/token";

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    // scope mínimo para Browse API (ajustable según lo que uses)
    scope: "https://api.ebay.com/oauth/api_scope",
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error obteniendo token de eBay:", res.status, text);
    throw new Error("No se pudo obtener el token de eBay");
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number; // segundos
  };

  ebayTokenCache.token = data.access_token;
  ebayTokenCache.expiresAt = Date.now() + data.expires_in * 1000;

  return data.access_token;
}
