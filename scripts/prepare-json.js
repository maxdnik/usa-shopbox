// scripts/prepare-json.js
import XLSX from 'xlsx';
import fs from 'fs';

const { readFile, utils } = XLSX;

async function prepareJson() {
  try {
    const fileName = 'apple.xlsx';
    console.log(`📖 Procesando ${fileName} con lógica de imágenes locales...`);

    const workbook = readFile(fileName);
    const sheetName = workbook.SheetNames[0]; 
    const sheet = workbook.Sheets[sheetName];
    
    // Convertimos la hoja a JSON
    const items = utils.sheet_to_json(sheet);
    console.log(`📊 Se encontraron ${items.length} SKUs para procesar.`);

    const grouped = {};

    items.forEach(item => {
      const model = item.Modelo;
      if (!model) return;

      if (!grouped[model]) {
        // Estructura de Modelo Maestro (Consolidación de Variantes)
        grouped[model] = {
          title: model,
          slug: model.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/\"/g, '')
            .replace(/[^a-z0-9-]/g, ''),
          store: "Apple",
          category: item.Categoria || "Electrónica",
          brand: "Apple",
          priceUSD: parseFloat(item['Precio (USD)']) || 0,
          estimatedUSD: Math.round((parseFloat(item['Precio (USD)']) || 0) * 1.35),
          description: item.Descripcion || "",
          
          // MAPEO DE IMÁGENES LOCALES
          // Toma el nombre del archivo del Excel y construye la ruta interna
          images: [
            item['Imagen 1'],
            item['Imagen 2'],
            item['Imagen 3']
          ].filter(img => img && typeof img === 'string' && img.trim() !== "")
           .map(imgName => `/images/products/${imgName.trim()}`),

          specs: {
            "Procesador": item.Procesador || "N/A",
            "RAM": item.RAM || "N/A",
            "Pantalla": item.Pantalla || "N/A",
            "Cámara": item['Cámar. T'] || "N/A",
            "Conector": item.Conector || "USB-C"
          },
          variations: []
        };
      }
      
      const price = parseFloat(item['Precio (USD)']) || 0;
      
      // Agregamos las variantes para el selector dinámico del frontend
      grouped[model].variations.push({
        attribute: "Capacidad",
        value: String(item.Memoria || "N/A").trim(),
        price: price,
        sku: item.SKU
      });

      grouped[model].variations.push({
        attribute: "Color",
        value: String(item.Color || "N/A").trim(),
        price: price,
        sku: item.SKU
      });
    });

    // Guardamos el resultado estructurado
    const finalData = Object.values(grouped);
    fs.writeFileSync('apple_structured_data.json', JSON.stringify(finalData, null, 2));
    
    console.log(`\n✨ ÉXITO: Se consolidaron ${finalData.length} modelos maestros.`);
    console.log(`📂 Ruta de imágenes configurada: /images/products/`);
    console.log("📂 Archivo generado: apple_structured_data.json");

  } catch (err) {
    console.error("❌ Error técnico en el procesamiento:", err.message);
  }
}

prepareJson();