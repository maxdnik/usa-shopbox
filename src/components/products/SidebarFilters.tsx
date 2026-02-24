"use client";

import React, { useState, useEffect } from "react";
import { Minus, Plus, Check } from "lucide-react";

export interface FilterItem {
  id: string;
  label: string;
  count?: number;
  isActive?: boolean;
}

export interface FilterSection {
  id: string;
  title: string;
  items: FilterItem[];
}

interface SidebarFiltersProps {
  title?: string;
  totalCount?: number;
  categoryTree?: { main: string; sub: string; leaf: string };
  filters?: FilterSection[];
  onFilterClick?: (sectionId: string, itemId: string) => void;
}

export default function SidebarFilters({
  title = "Resultados",
  totalCount,
  categoryTree,
  filters = [],
  onFilterClick,
}: SidebarFiltersProps) {
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (filters.length > 0 && Object.keys(openSections).length === 0) {
        const initial: Record<string, boolean> = {};
        filters.forEach(f => initial[f.id] = true);
        setOpenSections(initial);
    }
  }, [filters]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    // ✅ CAMBIO STICKY: 
    // 1. sticky top-24: Se pega dejando espacio para el header.
    // 2. max-h-[calc...]: Limita la altura al viewport para permitir scroll interno.
    // 3. overflow-y-auto: Habilita el scroll si los filtros son muchos.
    <aside 
      className="hidden lg:block w-[280px] shrink-0 bg-[#FAFBFC] border-r border-[#E5E7EB]/60 pr-8 py-8 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto"
      style={{
        // Estilización de scrollbar para Webkit (Chrome, Safari, Edge) - Estilo Apple Minimalista
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(156, 163, 175, 0.3) transparent'
      }}
    >
      <style jsx>{`
        aside::-webkit-scrollbar {
          width: 4px;
        }
        aside::-webkit-scrollbar-track {
          background: transparent;
        }
        aside::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background-color: rgba(10, 38, 71, 0.4);
        }
      `}</style>
      
      {/* Título Contextual */}
      <div className="mb-10">
        <h2 className="text-[11px] font-black tracking-[0.2em] uppercase text-[#9CA3AF] mb-4">
          Categoría
        </h2>
        {categoryTree && (
          <div className="space-y-2">
              <div className="text-[14px] font-medium text-gray-400 cursor-pointer hover:text-[#0A2647] transition-colors">
                {categoryTree.main}
              </div>
              <div className="text-[14px] font-medium text-gray-500 cursor-pointer hover:text-[#0A2647] transition-colors">
                {categoryTree.sub}
              </div>
              <div className="text-[15px] font-bold text-[#0A2647] cursor-default border-l-2 border-[#0A2647] pl-3 ml-[-1px]">
                {categoryTree.leaf}
              </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-8 mb-4">
        <span className="text-[11px] font-black tracking-[0.2em] uppercase text-[#9CA3AF]">
          Filtros
        </span>
      </div>

      <div className="space-y-2">
        {filters.map((section) => (
          <div key={section.id} className="border-b border-[#E5E7EB] py-6 last:border-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between group py-1 outline-none"
            >
              <span className="text-[13px] font-bold text-[#0A2647] uppercase tracking-wider">
                {section.title}
              </span>
              <span className="text-[#0A2647] opacity-40 group-hover:opacity-100 transition-opacity">
                {openSections[section.id] ? (
                  <Minus className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                )}
              </span>
            </button>

            {openSections[section.id] && (
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => onFilterClick?.(section.id, item.id)}
                    className="group flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3 transition-transform duration-200 ease-out group-hover:translate-x-[2px]">
                      
                      <div
                        className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                          item.isActive
                            ? "bg-[#0A2647] border-[#0A2647]"
                            : "bg-white border-slate-300 group-hover:border-[#0A2647]"
                        }`}
                      >
                        {item.isActive && (
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        )}
                      </div>
                      
                      <span
                        className={`text-[14px] transition-colors duration-200 ${
                          item.isActive
                            ? "font-bold text-[#0A2647]"
                            : "font-medium text-[#0A2647]/70 group-hover:text-[#0A2647]"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    
                    {item.count !== undefined && (
                      <span className="text-[11px] font-medium text-[#9CA3AF] group-hover:text-gray-500 transition-colors">
                        {item.count}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}