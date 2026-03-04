// scripts/generate-weight-map.mjs
// Generates a flat JSON map: keyword -> { weightKg, bufferPct }
// Target: 800+ entries (usually 1k-3k).
import fs from "node:fs";

function normKey(s) {
  return String(s).trim().toLowerCase();
}

function add(map, key, rule) {
  const k = normKey(key);
  if (!k) return;
  // Avoid overwriting unless you want priority.
  if (!map[k]) map[k] = rule;
}

function addMany(map, keys, rule) {
  for (const k of keys) add(map, k, rule);
}

function combine(prefixes, cores, suffixes = [""]) {
  const out = [];
  for (const p of prefixes) {
    for (const c of cores) {
      for (const s of suffixes) {
        const v = `${p} ${c}${s ? " " + s : ""}`.trim();
        out.push(v);
      }
    }
  }
  return out;
}

function build() {
  const map = {};

  // ---- RULES (tuneable) ----
  const R = {
    electronics_small: { weightKg: 0.6, bufferPct: 0.12 },
    electronics_med: { weightKg: 2.8, bufferPct: 0.15 },
    footwear: { weightKg: 1.8, bufferPct: 0.18 },
    boots: { weightKg: 2.2, bufferPct: 0.2 },
    apparel: { weightKg: 1.1, bufferPct: 0.2 },
    cooler_hard: { weightKg: 10.0, bufferPct: 0.22 },
    drinkware: { weightKg: 1.0, bufferPct: 0.15 },
    bags: { weightKg: 2.3, bufferPct: 0.2 },
    toys: { weightKg: 1.5, bufferPct: 0.18 },
    beauty: { weightKg: 0.8, bufferPct: 0.18 },
    tools: { weightKg: 3.5, bufferPct: 0.2 },
    auto_parts: { weightKg: 4.5, bufferPct: 0.25 },
    home_small: { weightKg: 1.2, bufferPct: 0.2 },
    home_bulky: { weightKg: 6.0, bufferPct: 0.25 },
    sports: { weightKg: 3.0, bufferPct: 0.22 },
  };

  // ---- 1) Smartphones & small electronics (tons of models/brands) ----
  const phoneBrands = [
    "apple", "iphone", "samsung", "galaxy", "google pixel", "pixel",
    "xiaomi", "redmi", "poco", "oneplus", "motorola", "moto",
    "huawei", "honor", "oppo", "realme", "sony", "nokia",
  ];

  const iphoneModels = [
    "iphone 11", "iphone 11 pro", "iphone 11 pro max",
    "iphone 12", "iphone 12 mini", "iphone 12 pro", "iphone 12 pro max",
    "iphone 13", "iphone 13 mini", "iphone 13 pro", "iphone 13 pro max",
    "iphone 14", "iphone 14 plus", "iphone 14 pro", "iphone 14 pro max",
    "iphone 15", "iphone 15 plus", "iphone 15 pro", "iphone 15 pro max",
  ];

  const samsungModels = [
    "galaxy s21", "galaxy s21+", "galaxy s21 ultra",
    "galaxy s22", "galaxy s22+", "galaxy s22 ultra",
    "galaxy s23", "galaxy s23+", "galaxy s23 ultra",
    "galaxy s24", "galaxy s24+", "galaxy s24 ultra",
    "galaxy a34", "galaxy a54", "galaxy a14", "galaxy a24",
    "galaxy z flip", "galaxy z fold",
  ];

  const pixelModels = [
    "pixel 6", "pixel 6 pro",
    "pixel 7", "pixel 7 pro",
    "pixel 8", "pixel 8 pro",
  ];

  addMany(map, phoneBrands, R.electronics_small);
  addMany(map, iphoneModels, R.electronics_small);
  addMany(map, samsungModels, R.electronics_small);
  addMany(map, pixelModels, R.electronics_small);

  addMany(
    map,
    [
      "airpods", "airpods pro", "earbuds", "headphones", "bluetooth headphones",
      "charger", "usb-c charger", "lightning cable", "usb-c cable",
      "power bank", "portable charger", "smartwatch", "apple watch",
      "galaxy watch", "fitbit", "garmin watch", "kindle", "e-reader",
      "streaming stick", "chromecast", "roku", "fire tv stick",
    ],
    R.electronics_small
  );

  // ---- 2) Laptops/Tablets/Consoles ----
  const laptopBrands = [
    "macbook", "macbook air", "macbook pro",
    "thinkpad", "lenovo", "dell", "hp", "asus", "acer", "msi",
    "surface laptop", "surface pro", "chromebook", "razer blade",
  ];
  const laptopFamilies = [
    "xps", "inspiron", "latitude",
    "pavilion", "envy", "spectre",
    "zenbook", "vivobook", "rog",
    "swift", "aspire", "nitro",
    "legion", "ideapad",
  ];
  addMany(map, laptopBrands, R.electronics_med);
  addMany(map, laptopFamilies, R.electronics_med);

  addMany(
    map,
    ["laptop", "notebook", "ultrabook", "gaming laptop", "tablet", "ipad", "ipad pro", "ipad air", "ipad mini"],
    R.electronics_med
  );

  addMany(
    map,
    ["ps5", "playstation 5", "ps4", "playstation 4", "xbox series x", "xbox series s", "xbox one", "nintendo switch"],
    R.electronics_med
  );

  // ---- 3) Footwear (brands + models + types) ----
  const shoeBrands = [
    "nike", "adidas", "new balance", "asics", "puma", "reebok", "converse",
    "vans", "salomon", "on running", "hoka", "brooks", "under armour",
  ];
  const nikeModels = [
    "dunk", "dunk low", "dunk high", "air max", "air max 90", "air max 95",
    "air force 1", "jordan 1", "jordan 4", "jordan 11", "pegasus",
  ];
  const adidasModels = ["ultraboost", "stan smith", "superstar", "gazelle", "samba", "yeezy"];
  const shoeTypes = ["sneaker", "sneakers", "running shoes", "basketball shoes", "skate shoes"];

  addMany(map, shoeBrands, R.footwear);
  addMany(map, nikeModels, R.footwear);
  addMany(map, adidasModels, R.footwear);
  addMany(map, shoeTypes, R.footwear);
  addMany(map, ["boot", "boots", "hiking boots", "work boots", "timberland"], R.boots);

  // ---- 4) Apparel (tons of keywords) ----
  const apparelTypes = [
    "t-shirt", "tshirt", "shirt", "hoodie", "sweater", "jacket", "coat", "parka",
    "pants", "jeans", "shorts", "dress", "skirt", "leggings", "underwear",
    "socks", "beanie", "cap", "hat", "gloves",
  ];
  const apparelBrands = [
    "patagonia", "filson", "north face", "the north face", "columbia", "arcteryx",
    "carhartt", "levi's", "ralph lauren", "tommy hilfiger", "calvin klein",
    "lululemon", "nike apparel", "adidas apparel",
  ];
  addMany(map, apparelTypes, R.apparel);
  addMany(map, apparelBrands, R.apparel);

  // ---- 5) Coolers & drinkware (YETI etc.) ----
  const coolerBrands = ["yeti", "rtic", "igloo", "coleman", "pelican cooler"];
  const coolerModels = ["tundra", "roadie", "hopper", "hard cooler", "ice chest"];
  addMany(map, coolerBrands, R.cooler_hard);
  addMany(map, coolerModels, R.cooler_hard);
  addMany(map, ["cooler", "hard cooler", "rolling cooler"], R.cooler_hard);

  const drinkware = [
    "tumbler", "insulated tumbler", "water bottle", "bottle", "thermos",
    "rambler", "mug", "travel mug", "cup", "stanley quencher", "stanley tumbler",
  ];
  addMany(map, drinkware, R.drinkware);

  // ---- 6) Bags/Luggage ----
  const bags = [
    "backpack", "daypack", "travel backpack", "duffel", "duffel bag",
    "carry on", "carry-on", "suitcase", "luggage", "messenger bag",
  ];
  addMany(map, bags, R.bags);

  // ---- 7) Toys/Collectibles ----
  const toys = [
    "lego", "lego set", "funko", "funko pop", "action figure", "collectible",
    "pokemon cards", "trading cards", "board game", "puzzle",
  ];
  addMany(map, toys, R.toys);

  // ---- 8) Beauty ----
  const beauty = [
    "perfume", "fragrance", "eau de parfum", "eau de toilette",
    "skincare", "serum", "moisturizer", "sunscreen",
    "makeup", "foundation", "lipstick",
  ];
  addMany(map, beauty, R.beauty);

  // ---- 9) Tools ----
  const toolBrands = ["dewalt", "milwaukee", "makita", "bosch", "ryobi"];
  const toolTypes = ["drill", "impact driver", "saw", "circular saw", "wrench", "socket set", "tool kit"];
  addMany(map, toolBrands, R.tools);
  addMany(map, toolTypes, R.tools);

  // ---- 10) Auto parts ----
  const auto = [
    "headlight", "taillight", "bumper", "brake pads", "brake rotor", "caliper",
    "oil filter", "air filter", "spark plug", "radiator", "alternator", "starter",
    "car stereo", "dash cam",
  ];
  addMany(map, auto, R.auto_parts);

  // ---- 11) Home ----
  addMany(
    map,
    ["blender", "coffee maker", "vacuum", "robot vacuum", "air fryer", "toaster", "kitchen scale"],
    R.home_small
  );
  addMany(
    map,
    ["office chair", "gaming chair", "standing desk", "mattress topper", "mini fridge", "microwave"],
    R.home_bulky
  );

  // ---- 12) Sports/outdoor ----
  addMany(
    map,
    ["snowboard", "ski", "ski boots", "helmet", "goggles", "bike", "bicycle", "surfboard", "wetsuit", "camp stove", "tent"],
    R.sports
  );

  // ---- MASS EXPANSION to reach 800+ deterministic entries ----
  // We generate many combinations like:
  // "nike air max", "nike air max 90", "adidas ultraboost", etc.
  const brandPrefixes = [
    "nike", "adidas", "new balance", "asics", "puma",
    "patagonia", "filson", "north face", "columbia",
    "dewalt", "milwaukee", "makita",
    "yeti", "stanley",
    "dell", "hp", "lenovo", "asus",
  ];

  const cores = [
    "jacket", "hoodie", "t-shirt", "pants", "backpack",
    "sneakers", "running shoes", "boots",
    "laptop", "tablet", "charger", "headphones",
    "cooler", "tumbler",
    "drill", "tool kit",
  ];

  const suffixes = [
    "men", "mens", "women", "womens", "kids",
    "large", "medium", "small",
    "waterproof", "insulated", "wireless",
  ];

  // Assign rules based on core token
  const combos = combine(brandPrefixes, cores, suffixes);
  for (const s of combos) {
    const t = s.toLowerCase();
    if (t.includes("cooler")) add(map, s, R.cooler_hard);
    else if (t.includes("tumbler")) add(map, s, R.drinkware);
    else if (t.includes("laptop") || t.includes("tablet")) add(map, s, R.electronics_med);
    else if (t.includes("charger") || t.includes("headphones")) add(map, s, R.electronics_small);
    else if (t.includes("sneakers") || t.includes("running shoes")) add(map, s, R.footwear);
    else if (t.includes("boots")) add(map, s, R.boots);
    else if (t.includes("backpack")) add(map, s, R.bags);
    else if (t.includes("drill") || t.includes("tool")) add(map, s, R.tools);
    else add(map, s, R.apparel);
  }

  // Safety: ensure 800+
  const count = Object.keys(map).length;
  return { map, count };
}

const { map, count } = build();
if (count < 800) {
  throw new Error(`Map too small: ${count}. Increase lists/combos.`);
}

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync("generated/weight-map.json", JSON.stringify(map, null, 2), "utf-8");

console.log(`✅ Generated ${count} keyword rules`);
console.log(`➡️  Output: generated/weight-map.json`);