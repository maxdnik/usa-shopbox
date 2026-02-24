// src/lib/constants/categories.ts

export type CategoryLeaf = string;

export type CategorySub = {
  name: string;
  leaves: CategoryLeaf[];
};

export type CategoryMain = {
  name: string;
  icon?: string;
  subcategories: CategorySub[];
};

export const CATEGORIES_MAP: CategoryMain[] = [
  {
    name: "Tecnología",
    icon: "💻",
    subcategories: [
      {
        name: "Celulares y Teléfonos",
        leaves: [
          "Celulares y Smartphones",
          "Accesorios para Celulares",
          "Repuestos de Celulares",
          "Smartwatches",
          "iPhones",
        ],
      },
      {
        name: "Computación",
        leaves: [
          "Componentes de PC",
          "Impresión",
          "Tablets y Accesorios",
          "PC",
          "Monitores y Accesorios",
          "Notebooks",
          "PC de Escritorio",
          "Monitores",
          "MacBooks",
          "iPads",
        ],
      },
      {
        name: "Cámaras y Accesorios",
        leaves: [
          "Cámaras Digitales",
          "Accesorios para Cámaras",
          "Filmadoras y Cámaras de Acción",
        ],
      },
      {
        name: "Consolas y Videojuegos",
        leaves: ["Videojuegos", "Para PlayStation", "Para Nintendo", "Consolas", "Accesorios"],
      },
      {
        name: "Electrónica, Audio y Video",
        leaves: ["Audio", "Accesorios para Audio y Video", "Drones y Accesorios", "Televisores"],
      },
      {
        name: "Audio",
        leaves: ["Auriculares", "Parlantes", "Equipos de Música"],
      },
    ],
  },

  {
    name: "Ropa y Accesorios",
    icon: "👕",
    subcategories: [
      { name: "Calzado", leaves: ["Zapatillas", "Zapatos", "Sandalias"] },
      { name: "Abrigos", leaves: ["Buzos y Camperas", "Tapados"] },
      {
        name: "Ropa",
        leaves: ["Remeras", "Camisas", "Buzos", "Camperas y Abrigos", "Pantalones", "Shorts"],
      },
      {
        name: "Accesorios",
        leaves: ["Gorros y Gorras", "Cinturones", "Guantes y Bufandas", "Otros Accesorios"],
      },
      {
        name: "Bolsos y Equipaje",
        leaves: ["Bolsos", "Mochilas", "Valijas", "Carteras"],
      },
      {
        name: "Ropa Interior y de Dormir",
        leaves: ["Medias", "Pijamas"],
      },
    ],
  },

  // ✅ NUEVA CATEGORÍA: MODA (ideal para Pandora / Joyería)
  {
    name: "Moda",
    icon: "👜",
    subcategories: [
      {
        name: "Joyería",
        leaves: [
          "Charms",
          "Pulseras",
          "Anillos",
          "Collares",
          "Aros",
          "Dijes",
          "Sets",
        ],
      },
      {
        name: "Relojes",
        leaves: ["Relojes", "Smartwatches", "Accesorios para Relojes"],
      },
      {
        name: "Lentes",
        leaves: ["Lentes de Sol", "Lentes de Lectura", "Accesorios para Lentes"],
      },
    ],
  },

  {
    name: "Hogar y Muebles",
    icon: "🏠",
    subcategories: [
      {
        name: "Cocina",
        leaves: ["Pequeños Electrodomésticos", "Termos y Botellas", "Almacenamiento", "Vajilla"],
      },
      { name: "Limpieza", leaves: ["Aspiradoras", "Tachos de Basura"] },
      { name: "Iluminación", leaves: ["Lámparas de Techo", "Lámparas de Mesa"] },
      { name: "Decoración", leaves: ["Cuadros", "Espejos"] },
    ],
  },

  {
    name: "Deportes y Fitness",
    icon: "🏃‍♂️",
    subcategories: [
      {
        name: "Running",
        leaves: ["Zapatillas de Running", "Indumentaria de Running", "Accesorios de Running"],
      },
      {
        name: "Outdoor",
        leaves: ["Calzado Outdoor", "Indumentaria Outdoor", "Accesorios Outdoor"],
      },
      {
        name: "Training",
        leaves: ["Calzado Training", "Indumentaria Training", "Accesorios Training"],
      },
    ],
  },
];