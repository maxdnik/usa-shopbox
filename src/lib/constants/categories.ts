// src/lib/constants/categories.ts

export const CATEGORIES_MAP = [
  {
    name: "Tecnología",
    icon: "💻",
    subcategories: [
      {
        name: "Celulares y Teléfonos",
        leaves: ["Celulares y Smartphones", "Accesorios para Celulares", "Repuestos de Celulares"]
      },
      {
        name: "Computación",
        leaves: ["Componentes de PC", "Impresión", "Tablets y Accesorios", "PC", "Monitores y Accesorios"]
      },
      {
        name: "Cámaras y Accesorios",
        leaves: ["Cámaras Digitales", "Accesorios para Cámaras", "Filmadoras y Cámaras de Acción"]
      },
      {
        name: "Consolas y Videojuegos",
        leaves: ["Videojuegos", "Para PlayStation", "Para Nintendo"]
      },
      {
        name: "Electrónica, Audio y Video",
        leaves: ["Audio", "Accesorios para Audio y Video", "Drones y Accesorios"]
      }
    ]
  },
  {
    name: "Hogar y Muebles",
    icon: "🏠",
    subcategories: [
      {
        name: "Cocina",
        leaves: ["Pequeños Electrodomésticos", "Termos y Botellas", "Almacenamiento"]
      },
      {
        name: "Limpieza",
        leaves: ["Aspiradoras", "Tachos de Basura"]
      }
    ]
  }
];