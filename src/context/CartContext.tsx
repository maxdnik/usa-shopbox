"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { LogisticProfile, CourierConfig } from "@/lib/logistics-profiles";
import {
  getLogisticProfile,
  COURIER_CONFIG_DEFAULT,
} from "@/lib/logistics-profiles";

/* ======================================================
   Tipos
====================================================== */

export type CartItem = {
  id: string;
  productId?: string;
  variantId?: string;

  sku?: string;
  slug?: string;
  title: string;

  price?: number;
  priceUSD: number;
  estimatedUSD?: number;
  netMargin?: number;

  quantity: number;

  image?: string;
  imageUrl?: string;

  // legacy
  weight?: number; // kg
  chargeableWeight?: number; // kg (compat UI vieja)

  // ✅ nueva
  logisticProfile?: LogisticProfile;

  selections?: Record<string, string>;
  specs?: Record<string, any>;

  sourceUrl?: string;
  store?: string;
  category?: any;

  // opcional (si viene)
  source?: "mongo" | "ebay" | "other";
  ebayCategoryPath?: string;
  brand?: string;
  weightKg?: number;
  dimensionsCm?: any;
};

type CartContextType = {
  items: CartItem[];
  cart: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;

  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;

  totalItems: number;
  totalUSD: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "usashopbox-cart";

/* ======================================================
   Helpers
====================================================== */

function hasValidLP(it: any) {
  return (
    typeof it?.logisticProfile?.billingWeightKg === "number" &&
    it.logisticProfile.billingWeightKg > 0
  );
}

function buildCourierConfig(_it?: any): CourierConfig {
  // Por ahora usamos defaults. Si después querés pasar config viva del admin,
  // lo hacemos desde el lugar que llama addToCart (ProductView) o metemos un setter global.
  return COURIER_CONFIG_DEFAULT;
}

function ensureLogisticsFrozen(it: any): CartItem {
  // Si ya venía bien, sólo aseguramos chargeableWeight
  if (hasValidLP(it)) {
    return {
      ...it,
      chargeableWeight:
        typeof it.chargeableWeight === "number" && it.chargeableWeight > 0
          ? it.chargeableWeight
          : it.logisticProfile.billingWeightKg,
    };
  }

  const courierConfig = buildCourierConfig(it);

  const lp = getLogisticProfile(
    {
      title: it?.title,
      category: it?.category,
      brand: it?.brand ?? it?.store,
      weightKg: it?.weightKg ?? it?.weight,
      dimensionsCm:
        it?.dimensionsCm ??
        it?.specs?.dimensionsCm ??
        it?.specs?.dimensions,
      source: it?.source === "ebay" ? "ebay" : "mongo",
      ebayCategoryPath: it?.ebayCategoryPath,
    },
    { courierConfig }
  );

  return {
    ...it,
    logisticProfile: lp,
    chargeableWeight: lp.billingWeightKg,
  };
}

/* ======================================================
   Provider
====================================================== */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /* ================= LOAD + MIGRATE ================= */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;

      // ✅ Migración: si venía un carrito viejo/roto, recalculamos y congelamos
      const migrated = parsed.map((it: any) => ensureLogisticsFrozen(it));
      setItems(migrated);
    } catch (err) {
      console.error("Error cargando carrito:", err);
    }
  }, []);

  /* ================= SAVE ================= */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Error guardando carrito:", err);
    }
  }, [items]);

  /* ================= ADD ================= */
  function addToCart(newItem: CartItem) {
    setItems((prev) => {
      // ✅ congelamos siempre antes de guardar
      const frozen = ensureLogisticsFrozen(newItem);

      // ✅ normalización fuerte
      const normalizedItem: CartItem = {
        ...frozen,
        id: String(frozen.id),
        title: String(frozen.title || ""),
        priceUSD: Number(frozen.priceUSD ?? 0),
        image: frozen.image || frozen.imageUrl,
        quantity: frozen.quantity && frozen.quantity > 0 ? frozen.quantity : 1,
      };

      const existingIdx = prev.findIndex((i) => i.id === normalizedItem.id);

      // Ya existe -> sumo cantidad, NO recalculo logística
      if (existingIdx !== -1) {
        return prev.map((i, idx) => {
          if (idx !== existingIdx) return i;

          return {
            ...i,
            quantity: (i.quantity ?? 1) + (normalizedItem.quantity ?? 1),

            // 🔒 mantener lo ya congelado en el item existente
            logisticProfile: i.logisticProfile ?? normalizedItem.logisticProfile,
            chargeableWeight: i.chargeableWeight ?? normalizedItem.chargeableWeight,

            image: i.image || normalizedItem.image,
          };
        });
      }

      return [...prev, normalizedItem];
    });
  }

  /* ================= REMOVE / CLEAR / UPDATE ================= */
  function removeFromCart(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  function updateQuantity(id: string, quantity: number) {
    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: q } : i)));
  }

  /* ================= TOTALS ================= */
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    [items]
  );

  const totalUSD = useMemo(
    () =>
      items.reduce((sum, item) => {
        const unit = Number(item.estimatedUSD ?? item.priceUSD ?? item.price ?? 0);
        const qty = Number(item.quantity ?? 1);
        return sum + unit * qty;
      }, 0),
    [items]
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      cart: items,

      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,

      setCart: setItems,

      totalItems,
      totalUSD,
    }),
    [items, totalItems, totalUSD]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}