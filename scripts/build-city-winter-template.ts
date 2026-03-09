import fs from "fs";
import path from "path";

const items = [
  { brand: "Woolrich", title: "Arctic Parka" },
  { brand: "Barbour", title: "Ashby Wax Jacket" },
  { brand: "Patagonia", title: "Frozen Range Parka" },
  { brand: "Arc'teryx", title: "Therme Parka" },
  { brand: "Nobis", title: "Cartel Parka" },
  { brand: "Moose Knuckles", title: "Stirling Parka" },
  { brand: "Filson", title: "Guide Wool Sweater" },
  { brand: "Fjallraven", title: "Ovik Knit Sweater" },
  { brand: "Pendleton", title: "Shetland Wool Sweater" },
  { brand: "Barbour", title: "Patch Crew Neck Sweater" },
  { brand: "Woolrich", title: "Pure Wool Crewneck" },
  { brand: "Norrona", title: "Warm Wool Sweater" },
  { brand: "Arc'teryx", title: "Covert Cardigan" },
  { brand: "Canada Goose", title: "Merino Beanie" },
  { brand: "Filson", title: "Watch Cap Beanie" },
  { brand: "Arc'teryx", title: "Rho Merino Beanie" },
  { brand: "Patagonia", title: "Brodeo Beanie" },
  { brand: "Fjallraven", title: "Classic Knit Hat" },
  { brand: "Filson", title: "Wool Scarf" },
  { brand: "Pendleton", title: "Yakima Camp Scarf" },
  { brand: "Hestra", title: "Leather Winter Gloves" },
  { brand: "Filson", title: "Insulated Gloves" },
  { brand: "Arc'teryx", title: "Venta Gloves" },
  { brand: "Blundstone", title: "Thermal Boots" },
  { brand: "Sorel", title: "Caribou Boots" },
  { brand: "Red Wing", title: "Iron Ranger Boots" },
  { brand: "Timberland", title: "Premium 6-Inch Waterproof" },
  { brand: "UGG", title: "Butte Boots" },
  { brand: "Sorel", title: "Madson II Boots" },
  { brand: "Filson", title: "Dryden Backpack" },
  { brand: "Bellroy", title: "Apex Backpack" },
  { brand: "Peak Design", title: "Everyday Backpack" },
  { brand: "YETI", title: "Crossroads Backpack 27L" },
  { brand: "Fjallraven", title: "Kanken No.2 Laptop Bag" },
  { brand: "Patagonia", title: "Nano Puff Jacket" },
  { brand: "Arc'teryx", title: "Atom Hoody" },
  { brand: "Filson", title: "Mackinaw Wool Vest" },
  { brand: "Barbour", title: "Tartan Lambswool Scarf" },
  { brand: "Danner", title: "Mountain 600 Chelsea Boots" },
  { brand: "Fjallraven", title: "Kanken Re-Wool Backpack" }
];

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferType(title: string) {
  const t = title.toLowerCase();

  if (t.includes("parka")) return "parka";
  if (t.includes("jacket") || t.includes("hoody")) return "jacket";
  if (t.includes("sweater") || t.includes("crewneck")) return "sweater";
  if (t.includes("cardigan")) return "cardigan";
  if (t.includes("beanie") || t.includes("hat")) return "beanie";
  if (t.includes("scarf")) return "scarf";
  if (t.includes("gloves")) return "gloves";
  if (t.includes("boots")) return "boots";
  if (t.includes("backpack") || t.includes("bag")) return "backpack";
  if (t.includes("vest")) return "vest";

  return "apparel";
}

function inferLeaf(type: string) {
  const map: Record<string, string> = {
    parka: "Parkas",
    jacket: "Jackets",
    sweater: "Sweaters",
    cardigan: "Knitwear",
    beanie: "Beanies",
    scarf: "Scarves",
    gloves: "Gloves",
    boots: "Boots",
    backpack: "Bags",
    vest: "Layering",
    apparel: "Apparel",
  };

  return map[type] || "Apparel";
}

const output = items.map((item, index) => {
  const type = inferType(item.title);
  const leaf = inferLeaf(type);
  const slug = slugify(`${item.brand} ${item.title}`);
  const id = `CITYW-${String(index + 1).padStart(3, "0")}`;

  return {
    id,
    type,
    title: item.title,
    brand: item.brand,
    store: "",
    category: {
      main: "Winter",
      sub: "City Winter",
      leaf,
    },
    slug,
    sku: id,
    priceUSD: 0,
    imageUrl: null,
    images: [],
    description: "",
    sizes: [],
    variants: [],
    inStock: true,
    featured: true,
    tags: ["city-winter", "premium", "urban-winter", type],
  };
});

const outPath = path.resolve(process.cwd(), "seeds/city-winter-seed-template.json");
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

console.log(`✅ Generated: ${outPath}`);
console.log(`Total items: ${output.length}`);