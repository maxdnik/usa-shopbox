type Props = {
  className?: string;
};

export default function LogoMark({ className = "h-8 w-8" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      {/* ===== Outer cube outline (white) ===== */}
      <path
        d="M18 46 L64 22 L110 46 V92 L64 116 L18 92 Z"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinejoin="round"
      />

      {/* ===== Left face (slightly dim white to mimic navy face) ===== */}
      <path d="M18 46 L64 72 V116 L18 92 Z" fill="rgba(255,255,255,0.78)" />

      {/* ===== Right face (brighter face) ===== */}
      <path d="M110 46 L64 72 V116 L110 92 Z" fill="rgba(255,255,255,0.22)" />

      {/* ===== Top face (very subtle) ===== */}
      <path d="M18 46 L64 22 L110 46 L64 72 Z" fill="rgba(255,255,255,0.10)" />

      {/* ===== Inner “U” portal (cut in navy) — BIGGER ===== */}
      <path
        d="
          M34 58
          V90
          Q34 100 44 100
          H58
          V110
          H42
          Q22 110 22 90
          V58
          Z
        "
        fill="#0A2647"
        opacity="0.95"
      />

      {/* ===== Inner front edge (white border hint to make it feel 3D) ===== */}
      <path
        d="M64 72 L110 46"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* ===== Red tab (bigger + cleaner plate) ===== */}
      <path d="M80 32 L110 46 L94 56 L64 42 Z" fill="#D72638" />
    </svg>
  );
}