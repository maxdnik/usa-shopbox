// src/lib/products.ts

export type Product = {
  id: string;
  title: string;
  store: string;
  imageUrl?: string;
  priceUSD: number;
  estimatedUSD: number;
  // Nueva estructura de categoría jerárquica
  category: {
    main: string; // Ej: "Tecnología"
    sub: string;  // Ej: "Computación"
    leaf: string; // Ej: "Tablets y Accesorios"
  };
  slug: string; // para URLs tipo /producto/sony-playstation-5
  description?: string;
};

// ✅ CAMBIO: Array vacío. 
// Esto elimina los productos de prueba "Local" del sistema.
export const mockProducts: Product[] = [];