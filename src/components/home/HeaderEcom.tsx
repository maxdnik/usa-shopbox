"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";

export default function HeaderEcom() {
  const { cart } = useCart();
  const totalItems = cart.length;

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  // Nombre del usuario (Google o registro manual)
  const userName = session?.user?.name?.split(" ")[0] || ""; 

  const router = useRouter();
  const [query, setQuery] = useState("");
  
  // 🛠️ ESTADOS Y REFS PARA NAVEGACIÓN SEGURA
  const [showCategories, setShowCategories] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null); 

  // Categorías con nombres exactos para que el buscador las encuentre
  const categoriesList = [
    { name: "Tecnología", slug: "Tecnología" },
    { name: "Celulares", slug: "Celulares y Teléfonos" },
    { name: "Computación", slug: "Computación" },
    { name: "Relojes", slug: "Relojes" },
    { name: "Audio", slug: "Audio" },
    { name: "Accesorios", slug: "Accesorios para Celulares" },
    { name: "Hogar", slug: "Hogar y Muebles" },
    { name: "Electrodomésticos", slug: "Electrodomésticos" }
  ];

  // 🛠️ LÓGICA DE BÚSQUEDA PREDICTIVA (AUTOCOMPLETE)
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

  // 🛠️ HANDLER DE CATEGORÍAS: Ejecuta la navegación y asegura el cierre
  const handleCategoryClick = (categorySlug: string) => {
    // Primero disparamos la navegación
    router.push(`/buscar?query=${encodeURIComponent(categorySlug)}`);
    // Cerramos el menú después de un brevísimo delay para que Next.js procese la ruta
    setTimeout(() => setShowCategories(false), 150);
  };

  // 🛠️ DETECTOR DE CLIC AFUERA (Nivel Senior)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Cerrar sugerencias si clic afuera del buscador
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSuggestions(false);
      }

      // Cerrar categorías SOLO si el clic es fuera del botón Y fuera del menú
      const categoryBtn = document.getElementById("category-btn");
      const isOutsideBtn = categoryBtn && !categoryBtn.contains(target);
      const isOutsideMenu = categoryMenuRef.current && !categoryMenuRef.current.contains(target);

      if (isOutsideBtn && isOutsideMenu) {
        setShowCategories(false);
      }
    };

    // Usamos 'click' para evitar que 'mousedown' mate la acción del botón
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    router.push(`/buscar?query=${encodeURIComponent(trimmed)}`);
  };

  const handleSelectSuggestion = (slug: string) => {
    setShowSuggestions(false);
    setQuery(""); 
    router.push(`/producto/${slug}`);
  };

  return (
    <header className="bg-[#0A2647] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        
        {/* LOGO USASHOPBOX */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-xs font-bold text-[#0A2647] group-hover:scale-110 transition-transform">
            USA
          </div>
          <span className="font-extrabold text-xl tracking-tight hidden sm:inline uppercase">
            USAShopBox
          </span>
        </Link>

        {/* 📂 MENU DE CATEGORÍAS */}
        <div className="relative">
          <button
            id="category-btn"
            onClick={(e) => {
              e.stopPropagation(); 
              setShowCategories(!showCategories);
            }}
            className="flex items-center gap-1 text-sm font-semibold opacity-90 hover:opacity-100 transition outline-none py-2"
          >
            Categorías
            <span className={`text-[10px] transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showCategories && (
            <div 
              ref={categoryMenuRef}
              className="absolute top-full left-0 mt-4 w-52 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
            >
              {categoriesList.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="w-full text-left block px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[#D72638] transition-colors tracking-tighter uppercase"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 🔍 BUSCADOR */}
        <div className="flex-1 relative" ref={searchRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center rounded-md overflow-hidden bg-white shadow-inner"
          >
            <input
              type="text"
              placeholder="Buscá productos, marcas o tiendas en USA..."
              className="flex-1 px-4 py-2 text-sm text-slate-800 outline-none"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold bg-[#D72638] hover:bg-[#b81e2d] transition uppercase tracking-tighter"
            >
              Buscar
            </button>
          </form>

          {/* SUGERENCIAS */}
          {showSuggestions && (suggestions.length > 0 || isSearching) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-2xl border border-slate-100 overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-center text-slate-300 text-xs font-bold uppercase animate-pulse">
                  Buscando...
                </div>
              ) : (
                suggestions.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelectSuggestion(item.slug)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-left group"
                  >
                    <div className="w-10 h-10 relative shrink-0 bg-white rounded-lg border border-slate-50 p-1">
                      {/* 🛠️ FIX: Eliminadas las barras invertidas que causaban el error */}
                      <img 
                        src={item.images?.[0] || item.image} 
                        alt="" 
                        className="object-contain w-full h-full group-hover:scale-110 transition-transform" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 line-clamp-1 uppercase tracking-tighter">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-black text-[#D72638] uppercase">
                        USD {item.priceUSD || item.price}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* 👤 ACCIONES Y CARRITO */}
        <div className="hidden md:flex items-center gap-4 text-sm shrink-0">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="hover:underline font-semibold">Ingresar</Link>
              <Link href="/register" className="border border-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-white hover:text-[#0A2647] transition">
                Crear cuenta
              </Link>
            </>
          ) : (
            <div className="flex flex-col items-start text-xs">
              <span className="opacity-80 text-[11px] font-bold">Hola, {userName}</span>
              <div className="flex gap-3 mt-1 font-semibold">
                <Link href="/dashboard/account" className="hover:underline">Mi cuenta</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="hover:underline text-white/90">
                  Salir
                </button>
              </div>
            </div>
          )}

          {/* 🛒 CARRITO CON TEXTO */}
          <Link href="/carrito" className="relative flex items-center gap-2 text-xs font-semibold group">
            <span className="text-xl group-hover:scale-110 transition-transform">🛒</span>
            <span className="uppercase tracking-tighter">CARRITO</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -left-2 bg-[#D72638] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-black animate-in zoom-in shadow-lg">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}