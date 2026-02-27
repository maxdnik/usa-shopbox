"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import Image from "next/image";

const CATEGORIES = [
  { name: "Tecnología", slug: "Tecnología" },
  { name: "Celulares", slug: "Celulares y Teléfonos" },
  { name: "Computación", slug: "Computación" },
  { name: "Relojes", slug: "Relojes" },
  { name: "Audio", slug: "Audio" },
  { name: "Accesorios", slug: "Accesorios para Celulares" },
  { name: "Hogar", slug: "Hogar y Muebles" },
  { name: "Electrodomésticos", slug: "Electrodomésticos" },
  { name: "Zapatillas", slug: "Zapatillas" },
  { name: "Ropa", slug: "Ropa" },
];

export default function HeaderEcomClient() {
  const { cart } = useCart();
  const totalItems = cart.length;

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const userName = session?.user?.name?.split(" ")[0] || "";

  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchRef = useRef<HTMLFormElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        setIsSearching(true);
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions((data.products || []).slice(0, 5));
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/buscar?query=${encodeURIComponent(query)}`);
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    setShowSuggestions(false);
    setQuery("");
    router.push(`/producto/${slug}`);
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/buscar?query=${encodeURIComponent(slug)}`);
  };

  const easePremium = "cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className="w-full backdrop-blur-md transition-all duration-300 relative"
        style={{
          background: "linear-gradient(180deg, #0A2647 0%, #0E2F57 60%, #0A2647 100%)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.06), 0 10px 40px rgba(0,0,0,0.18)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3 md:px-8 gap-4 md:gap-8 relative z-10">
            {/* ✅ LEFT BRAND */}
            <Link
              href="/"
              className="group transition-transform duration-150 hover:scale-[1.02]"
              style={{ transitionTimingFunction: easePremium }}
            >
              <div className="flex items-center gap-4">
                {/* Isotipo */}
                <div className="flex items-center gap-4">
                  {/* Isotipo */}
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                      <Image
                        src="/usa.png"
                        alt="USA Shop Box"
                        width={548}
                        height={548}
                        className="h-full w-full object-contain scale-[1.9]"
                        priority
                      />
                    </div>
                   
                  {/* Wordmark */}
                  <div className="flex flex-col leading-none">
                    <span className="text-white font-semibold tracking-wide text-xl">
                      USASHOPBOX
                    </span>

                    {/* 👇 underline alineado EXACTO al texto */}
                    <div                     className="
                      mt-2
                      h-[3px] w-[140px] sm:w-[160px] md:w-[180px] max-w-[180px] usb-underline-taper -ml-8
                    " />
                  </div>
                </div>
              </div>
            </Link>

            {/* SEARCH */}
            <div className="relative w-full md:w-[520px] group">
              <form ref={searchRef} onSubmit={handleSearchSubmit} className="relative w-full">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Buscar productos, marcas o tiendas..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full h-[44px] pl-5 pr-12 rounded-full border-none outline-none font-inter text-[15px] transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.95)",
                      color: "#0A2647",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    }}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setShowSuggestions(false);
                      }}
                      className="absolute right-12 text-slate-400 hover:text-slate-600"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-4 text-[#0A2647] opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="Buscar"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                <div
                  className="absolute inset-0 rounded-full pointer-events-none transition-opacity opacity-0 group-focus-within:opacity-100"
                  style={{
                    boxShadow: "0 0 0 3px rgba(215,38,56,0.15), 0 4px 18px rgba(0,0,0,0.25)",
                  }}
                />
              </form>

              {showSuggestions && (suggestions.length > 0 || isSearching) && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                >
                  {isSearching ? (
                    <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase animate-pulse">
                      Buscando...
                    </div>
                  ) : (
                    suggestions.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => handleSelectSuggestion(item.slug)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left group"
                      >
                        <div className="w-10 h-10 relative shrink-0 bg-white rounded-lg border border-slate-100 p-1 overflow-hidden">
                          <img
                            src={item.images?.[0] || item.image || "/placeholder.png"}
                            alt=""
                            className="object-contain w-full h-full group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[11px] font-bold text-[#D72638]">
                            USD {item.priceUSD || item.price}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4 md:gap-6 shrink-0">
              {!isLoggedIn ? (
                <div className="hidden md:flex items-center gap-4 text-[13px] font-medium text-white/85">
                  <Link href="/login" className="hover:text-white transition-colors">
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-white transition-colors border border-white/10"
                  >
                    Crear cuenta
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-4 text-[13px] font-medium text-white/85">
                  <div className="flex flex-col items-end leading-tight">
                    <span className="opacity-70 text-[11px] uppercase tracking-wide">
                      Hola, {userName}
                    </span>
                    <Link href="/dashboard/account" className="hover:text-white transition-colors">
                      Mi cuenta
                    </Link>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="hover:text-red-400 transition-colors"
                    title="Salir"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4 opacity-80" />
                  </button>
                </div>
              )}

              <Link href={isLoggedIn ? "/dashboard/account" : "/login"} className="md:hidden text-white/90">
                <User className="w-6 h-6" />
              </Link>

              <Link
                href="/carrito"
                className="relative group transition-transform duration-150 hover:scale-105"
                style={{ transitionTimingFunction: easePremium }}
              >
                <ShoppingCart className="w-6 h-6 text-white opacity-90 group-hover:opacity-100" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white rounded-full px-1 animate-in zoom-in bg-[#D72638] shadow-[0_2px_8px_rgba(215,38,56,0.5)]">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* divider */}
          <div className="w-full h-[1px] relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[1px]" />
          </div>

          {/* categories */}
          <div
            className="w-full relative"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
            }}
          >
            <div className="flex items-center justify-center overflow-x-auto no-scrollbar py-2 px-4 md:px-8 gap-2">
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-semibold text-white shrink-0 transition-transform duration-150 hover:-translate-y-[1px]"
                style={{
                  background: "rgba(10,38,71,0.85)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  transitionTimingFunction: easePremium,
                }}
              >
                <Menu className="w-3.5 h-3.5" />
                <span>Categorías</span>
              </button>

              <div className="w-[1px] h-5 bg-white/10 mx-1 shrink-0" />

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 shrink-0 cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    color: "#0A2647",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                    transitionTimingFunction: easePremium,
                  }}
                >
                  <span className="hover:text-red-600 transition-colors">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}