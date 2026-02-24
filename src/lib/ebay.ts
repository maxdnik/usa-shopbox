// lib/ebay.ts
// Helper para manejar el token de eBay

export type VariationSelection = Record<string, string>;

export type ProductVariation = {
  attribute: string;
  value: string;
  sku?: string;
  price?: number;
  available?: boolean;
};

export type VariationMatrixEntry = {
  selections: VariationSelection;
  sku?: string;
  price?: number;
  available?: boolean;
};

export type EbayItemDetail = {
  variations: ProductVariation[];
  variationMatrix: VariationMatrixEntry[];
  images: string[];
  available: boolean;
  priceUSD?: number;
};

type EbayPrice = {
  value?: string | number;
  currency?: string;
};

type EbayImage = {
  imageUrl?: string;
  url?: string;
};

type EbayAvailability = {
  availabilityStatus?: string;
  quantity?: number;
};

// ✅ Soporte para formatos itemSpecifics / localizedAspects / aspects
type EbayAspect = {
  name?: string;
  value?: string | string[];
};

type EbayItemDetailResponse = {
  itemId?: string;
  itemGroupId?: string;
  price?: EbayPrice;
  image?: EbayImage;
  additionalImages?: EbayImage[];
  availability?: EbayAvailability;

  itemSpecifics?: EbayAspect[];
  localizedAspects?: EbayAspect[];
  aspects?: EbayAspect[];
};

type EbayItemGroupItem = {
  itemId?: string;
  sku?: string;
  price?: EbayPrice;
  availability?: EbayAvailability;

  // En algunos responses de eBay, puede venir imagen acá también
  image?: EbayImage;
  additionalImages?: EbayImage[];

  itemSpecifics?: EbayAspect[];
  localizedAspects?: EbayAspect[];
  aspects?: EbayAspect[];
};

type EbayItemGroupResponse = {
  itemGroupId?: string;
  items?: EbayItemGroupItem[];
};

// ✅ NUEVO: error schema para detectar errorId 11006
type EbayApiErrorResponse = {
  errors?: Array<{
    errorId?: number;
    domain?: string;
    category?: string;
    message?: string;
    parameters?: Array<{ name?: string; value?: string }>;
  }>;
};

// ✅ NUEVO: response de get_items_by_item_group
type EbayItemsByGroupResponse = {
  itemGroupId?: string;
  items?: EbayItemGroupItem[];
};

let ebayTokenCache: {
  token: string | null;
  expiresAt: number; // timestamp en ms
} = {
  token: null,
  expiresAt: 0,
};

export async function getEbayAccessToken(): Promise<string> {
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

function extractLegacyItemId(input: string): string | null {
  try {
    const parsedUrl = new URL(input);
    const params = parsedUrl.searchParams;
    const paramId =
      params.get("item") ||
      params.get("itemId") ||
      params.get("item_id") ||
      params.get("iid");

    if (paramId) return paramId;

    const match = parsedUrl.pathname.match(/\/itm\/(?:[^/]+\/)?(\d+)/i);
    if (match?.[1]) return match[1];
  } catch {
    return null;
  }

  const match = input.match(/(\d{8,})/);
  return match?.[1] ?? null;
}

function normalizePrice(price?: EbayPrice): number | undefined {
  if (!price?.value) return undefined;
  if (typeof price.value === "number") return price.value;
  const parsed = Number.parseFloat(price.value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function normalizeValues(value?: string | string[]): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value];
}

function extractImages(item?: EbayItemDetailResponse): string[] {
  if (!item) return [];
  const images = [
    item.image?.imageUrl,
    item.image?.url,
    ...(item.additionalImages || []).map((img) => img.imageUrl || img.url),
  ].filter((img): img is string => Boolean(img));
  return Array.from(new Set(images));
}

function isAvailable(availability?: EbayAvailability): boolean {
  if (!availability) return true;
  if (availability.availabilityStatus) {
    return availability.availabilityStatus === "IN_STOCK";
  }
  if (typeof availability.quantity === "number") {
    return availability.quantity > 0;
  }
  return true;
}

// ✅ NUEVO: helper para tomar aspects desde cualquiera de los campos posibles
function getAspectsFromAny(obj: {
  itemSpecifics?: EbayAspect[];
  localizedAspects?: EbayAspect[];
  aspects?: EbayAspect[];
}): EbayAspect[] {
  return obj.itemSpecifics ?? obj.localizedAspects ?? obj.aspects ?? [];
}

export async function fetchEbayItemDetail(
  itemIdOrUrl: string
): Promise<EbayItemDetail> {
  const emptyResult: EbayItemDetail = {
    variations: [],
    variationMatrix: [],
    images: [],
    available: true,
  };

  if (!itemIdOrUrl) return emptyResult;

  const accessToken = await getEbayAccessToken();

  // ✅ Marketplace header requerido por Browse API en muchos casos
  const marketplaceId = process.env.EBAY_MARKETPLACE_ID || "EBAY_US";
  const ebayHeaders = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
    "X-EBAY-C-MARKETPLACE-ID": marketplaceId,
  } as const;

  const isItemId = itemIdOrUrl.includes("v1|");
  const legacyItemId = isItemId ? null : extractLegacyItemId(itemIdOrUrl);

  const itemEndpoint = isItemId
    ? `https://api.ebay.com/buy/browse/v1/item/${encodeURIComponent(itemIdOrUrl)}`
    : legacyItemId
      ? `https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${encodeURIComponent(
          legacyItemId
        )}`
      : null;

  if (!itemEndpoint) return emptyResult;

  const itemRes = await fetch(itemEndpoint, { headers: ebayHeaders });

  // ✅ IMPORTANTE: si no ok, log + fallback 11006
  if (!itemRes.ok) {
    const text = await itemRes.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {}

    const has11006 = Array.isArray(parsed?.errors)
      ? parsed.errors.some((e: any) => e?.errorId === 11006)
      : false;

    if (has11006) {
      console.warn("eBay item legacy_id inválido (11006). Usando fallback item_group.", {
        status: itemRes.status,
        endpoint: itemEndpoint,
      });
    } else {
      console.error("eBay itemRes NOT OK", {
        status: itemRes.status,
        endpoint: itemEndpoint,
        body: text,
      });
    }

    // ✅ Fallback: si eBay dice errorId 11006, ese número se interpreta como item_group_id
    try {
      const err = JSON.parse(text) as EbayApiErrorResponse;
      const has11006 = (err.errors || []).some((e) => e.errorId === 11006);

      if (has11006 && legacyItemId) {
        const byGroupEndpoint = `https://api.ebay.com/buy/browse/v1/item/get_items_by_item_group?item_group_id=${encodeURIComponent(
          legacyItemId
        )}`;

        const byGroupRes = await fetch(byGroupEndpoint, { headers: ebayHeaders });

        if (!byGroupRes.ok) {
          const byGroupText = await byGroupRes.text();
          console.error("eBay get_items_by_item_group NOT OK", {
            status: byGroupRes.status,
            endpoint: byGroupEndpoint,
            body: byGroupText,
          });
          return emptyResult;
        }

        const byGroupData = (await byGroupRes.json()) as EbayItemsByGroupResponse;
        const items = byGroupData.items ?? [];

        if (items.length === 0) return emptyResult;

        const variationMap = new Map<string, ProductVariation>();
        const variationMatrix: VariationMatrixEntry[] = [];

        items.forEach((item) => {
          const selections: VariationSelection = {};

          getAspectsFromAny(item).forEach((spec) => {
            if (!spec.name) return;
            const values = normalizeValues(spec.value);
            if (values.length === 0) return;

            selections[spec.name] = values[0];

            values.forEach((value) => {
              const key = `${spec.name}::${value}`;
              if (!variationMap.has(key)) {
                variationMap.set(key, {
                  attribute: spec?.name ?? "Unknown",
                  value,
                  sku: item.sku,
                  price: normalizePrice(item.price),
                  available: isAvailable(item.availability),
                });
              }
            });
          });

          if (Object.keys(selections).length > 0) {
            variationMatrix.push({
              selections,
              sku: item.sku || item.itemId,
              price: normalizePrice(item.price),
              available: isAvailable(item.availability),
            });
          }
        });

        // imágenes/precio base: tomamos del primer item (si hay)
        const first = items[0];

        const images = Array.from(
          new Set(
            [
              first?.image?.imageUrl,
              first?.image?.url,
              ...(first?.additionalImages || []).map((img) => img.imageUrl || img.url),
            ].filter((img): img is string => Boolean(img))
          )
        );

        const available = items.some((it) => isAvailable(it.availability));
        const priceUSD =
          normalizePrice(items.find((it) => normalizePrice(it.price))?.price) ??
          normalizePrice(items[0]?.price);

        return {
          variations: Array.from(variationMap.values()),
          variationMatrix,
          images,
          available,
          priceUSD,
        };
      }
    } catch {
      // ignore parse errors
    }

    return emptyResult;
  }

  // ✅ item OK
  const itemData = (await itemRes.json()) as EbayItemDetailResponse;
  const images = extractImages(itemData);
  const available = isAvailable(itemData.availability);
  const priceUSD = normalizePrice(itemData.price);

  const variationMap = new Map<string, ProductVariation>();
  const variationMatrix: VariationMatrixEntry[] = [];

  // Si viene itemGroupId, usamos item_group endpoint (preferido para combinaciones)
  if (itemData.itemGroupId) {
    const groupEndpoint = `https://api.ebay.com/buy/browse/v1/item_group/${encodeURIComponent(
      itemData.itemGroupId
    )}`;

    const groupRes = await fetch(groupEndpoint, { headers: ebayHeaders });

    if (!groupRes.ok) {
      const text = await groupRes.text();
      console.error("eBay groupRes NOT OK", {
        status: groupRes.status,
        endpoint: groupEndpoint,
        body: text,
      });
    } else {
      const groupData = (await groupRes.json()) as EbayItemGroupResponse;
      const items = groupData.items ?? [];

      items.forEach((item) => {
        const selections: VariationSelection = {};

        getAspectsFromAny(item).forEach((spec) => {
          if (!spec.name) return;
          const values = normalizeValues(spec.value);
          if (values.length === 0) return;

          selections[spec.name] = values[0];

          values.forEach((value) => {
            const key = `${spec.name}::${value}`;
            if (!variationMap.has(key)) {
              variationMap.set(key, {
                attribute: spec?.name ?? "Unknown",
                value,
                sku: item.sku,
                price: normalizePrice(item.price),
                available: isAvailable(item.availability),
              });
            }
          });
        });

        if (Object.keys(selections).length > 0) {
          variationMatrix.push({
            selections,
            sku: item.sku || item.itemId,
            price: normalizePrice(item.price),
            available: isAvailable(item.availability),
          });
        }
      });
    }
  }

  // fallback: si no hay nada en group, usar aspects del item base
  const baseAspects = getAspectsFromAny(itemData);

  if (variationMap.size === 0 && baseAspects.length > 0) {
    baseAspects.forEach((spec) => {
      if (!spec.name) return;
      normalizeValues(spec.value).forEach((value) => {
        const key = `${spec.name}::${value}`;
        if (!variationMap.has(key)) {
          variationMap.set(key, {
            attribute: spec.name ?? "Unknown",
            value,
          });
        }
      });
    });
  }

  return {
    variations: Array.from(variationMap.values()),
    variationMatrix,
    images,
    available,
    priceUSD,
  };
}