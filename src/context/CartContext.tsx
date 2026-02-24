"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* ======================================================
   Tipos
====================================================== */

export type CartItem = {
  // identificadores
  id: string;
  productId?: string;
  variantId?: string;

  // catálogo
  sku?: string;
  slug?: string;
  title: string;

  // pricing
  price?: number; // ✅ compat UI vieja (algunos componentes usan "price")
  priceUSD: number; // precio base USA
  estimatedUSD?: number; // precio final estimado
  netMargin?: number; // margen neto unitario (opcional)

  // cantidad
  quantity: number;

  // visual
  image?: string;
  imageUrl?: string;

  // logística
  weight?: number; // kg
  chargeableWeight?: number; // ✅ kg calculado por engine (para CartPageContent)

  // variantes / atributos (talle, color, etc.)
  selections?: Record<string, string>;
  specs?: Record<string, any>;

  // trazabilidad (origen del producto)
  sourceUrl?: string;

  // metadata opcional
  store?: string;
  category?: any;
};

type CartContextType = {
  // API nueva
  items: CartItem[];

  // API vieja (compatibilidad con UI existente)
  cart: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;

  // compat (por si algún componente usa setCart directo)
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;

  totalItems: number;
  totalUSD: number;
};

/* ======================================================
   Context
====================================================== */

const CartContext = createContext<CartContextType | undefined>(undefined);

/* ======================================================
   Provider
====================================================== */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /* -----------------------------
     Persistencia (localStorage)
  ----------------------------- */

  useEffect(() => {
    try {
      const stored = localStorage.getItem("usashopbox-cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Error cargando carrito:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("usashopbox-cart", JSON.stringify(items));
    } catch (err) {
      console.error("Error guardando carrito:", err);
    }
  }, [items]);

  /* -----------------------------
     Acciones
  ----------------------------- */

  function addToCart(newItem: CartItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);

      // Normalización centralizada
      const normalizedItem: CartItem = {
        ...newItem,
        image: newItem.image || newItem.imageUrl,
        quantity: newItem.quantity > 0 ? newItem.quantity : 1,
      };

      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id
            ? { ...i, quantity: i.quantity + normalizedItem.quantity }
            : i
        );
      }

      return [...prev, normalizedItem];
    });
  }

  function removeFromCart(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }

  /* -----------------------------
     Totales
  ----------------------------- */

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalUSD = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + (item.estimatedUSD ?? item.priceUSD ?? 0) * item.quantity,
        0
      ),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        // nueva
        items,
        // compat vieja
        cart: items,

        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,

        // compat
        setCart: setItems,

        totalItems,
        totalUSD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ======================================================
   Hook
====================================================== */

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}