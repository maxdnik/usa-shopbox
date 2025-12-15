// src/components/home/CategoryBar.tsx
const categories = [
  "Zapatillas",
  "Ropa y moda",
  "Electrónica",
  "Celulares",
  "Gaming",
  "Hogar",
  "Belleza",
  "Niños",
  "Relojes",
  "Accesorios",
];

export default function CategoryBar() {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-3 overflow-x-auto text-xs md:text-sm">
        {categories.map((cat) => (
          <button
            key={cat}
            className="whitespace-nowrap px-3 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
          >
            {cat}
          </button>
        ))}
      </div>
    </nav>
  );
}
