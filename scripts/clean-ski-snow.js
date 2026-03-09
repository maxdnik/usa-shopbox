const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(process.cwd(), "ski-snow.json");

function cleanItem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return item;

  const next = { ...item };

  // images: [{ url: ... }]  -> imageUrls: [...]
  if (Array.isArray(next.images)) {
    const urls = next.images
      .map((img) => {
        if (typeof img === "string") return img.trim();
        if (img && typeof img === "object" && img.url) return String(img.url).trim();
        return null;
      })
      .filter(Boolean);

    if (urls.length) {
      const existing = Array.isArray(next.imageUrls) ? next.imageUrls.map(String) : [];
      next.imageUrls = Array.from(new Set([...existing, ...urls]));
    }

    delete next.images;
  }

  // borrar campos no deseados
  delete next.availability;
  delete next.stock;
  delete next.stockNote;
  delete next.inStockNote;
  delete next.inStock;

  // si existe wrapper products, limpiarlo también
  if (Array.isArray(next.products)) {
    next.products = next.products.map(cleanItem);
  }

  return next;
}

function main() {
  if (!fs.existsSync(FILE_PATH)) {
    throw new Error(`No encontré el archivo: ${FILE_PATH}`);
  }

  const raw = fs.readFileSync(FILE_PATH, "utf8");
  const json = JSON.parse(raw);

  let cleaned;

  if (Array.isArray(json)) {
    cleaned = json.map(cleanItem);
  } else if (json && typeof json === "object") {
    cleaned = cleanItem(json);
  } else {
    throw new Error("El JSON no es un array ni un objeto válido");
  }

  fs.writeFileSync(FILE_PATH, JSON.stringify(cleaned, null, 2), "utf8");
  console.log(`✅ Archivo limpiado: ${FILE_PATH}`);
}

try {
  main();
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}