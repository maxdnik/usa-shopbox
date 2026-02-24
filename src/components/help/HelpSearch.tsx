"use client";

import { useMemo, useState } from "react";

type Props = {
  title: string;
  placeholder: string;
  helperText?: string;
  suggestedChips?: string[];
  value: string;
  onChange: (value: string) => void;
  onChipClick?: (chip: string) => void;
};

export default function HelpSearch({
  title,
  placeholder,
  helperText,
  suggestedChips = [],
  value,
  onChange,
  onChipClick,
}: Props) {
  const hasValue = value.trim().length > 0;

  const chips = useMemo(() => suggestedChips.slice(0, 8), [suggestedChips]);

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
        {title}
      </h1>

      <div className="mt-4">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-base outline-none focus:border-neutral-400"
        />
        {helperText ? (
          <p className="mt-2 text-sm text-neutral-600">{helperText}</p>
        ) : null}
      </div>

      {!hasValue && chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onChipClick?.(chip)}
              className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700 hover:border-neutral-400"
            >
              {chip}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}