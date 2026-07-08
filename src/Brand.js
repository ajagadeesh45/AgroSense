// ═══════════════════════════════════════════════
//  AgroSense — Brand Identity System
// ═══════════════════════════════════════════════

export const BRAND = {
  name:    "AgroSense",
  tagline: "Sense the Farm. Grow the Future.",
  version: "1.0.0",
};

// ── Color Palette ────────────────────────────────
export const COLORS = {
  // Primary — Deep Forest Green
  primary: {
    50:  "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },
  // Secondary — Electric Teal
  teal: {
    50:  "#f0fdfa",
    100: "#ccfbf1",
    200: "#99f6e4",
    300: "#5eead4",
    400: "#2dd4bf",
    500: "#14b8a6",
    600: "#0d9488",
    700: "#0f766e",
    800: "#115e59",
    900: "#134e4a",
    950: "#042f2e",
  },
  // Accent — Warm Amber
  amber: {
    50:  "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03",
  },
  // Blue — for Weather
  blue: {
    50:  "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
  // Neutral
  gray: {
    50:  "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
  // Semantic
  success: "#22c55e",
  warning: "#f59e0b",
  error:   "#ef4444",
  info:    "#3b82f6",
  white:   "#ffffff",
  black:   "#000000",
};

// ── Typography ───────────────────────────────────
export const FONTS = {
  heading: "'DM Serif Display', Georgia, serif",
  body:    "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  mono:    "'JetBrains Mono', 'Fira Code', monospace",
};

// ── Gradients ────────────────────────────────────
export const GRADIENTS = {
  // Main brand gradient
  primary:   "linear-gradient(135deg, #052e16 0%, #14532d 40%, #0f766e 100%)",
  // Hero background
  hero:      "linear-gradient(160deg, #030712 0%, #052e16 35%, #134e4a 70%, #14532d 100%)",
  // Card overlays
  card:      "linear-gradient(135deg, rgba(5,46,22,.95) 0%, rgba(15,118,110,.9) 100%)",
  // Feature cards
  disease:   "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)",
  crop:      "linear-gradient(135deg, #14532d 0%, #14b8a6 100%)",
  weather:   "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
  price:     "linear-gradient(135deg, #78350f 0%, #f59e0b 100%)",
  // Splash
  splash:    "linear-gradient(160deg, #030712 0%, #052e16 50%, #042f2e 100%)",
  // Glass effect
  glass:     "rgba(255,255,255,0.07)",
  glassDark: "rgba(0,0,0,0.35)",
};

// ── Shadows ──────────────────────────────────────
export const SHADOWS = {
  sm:    "0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.08)",
  md:    "0 4px 16px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.1)",
  lg:    "0 8px 32px rgba(0,0,0,.24), 0 4px 12px rgba(0,0,0,.12)",
  xl:    "0 20px 60px rgba(0,0,0,.35), 0 8px 24px rgba(0,0,0,.18)",
  glow:  "0 0 24px rgba(20,184,166,.35)",
  card:  "0 4px 24px rgba(5,46,22,.3)",
  inner: "inset 0 2px 8px rgba(0,0,0,.15)",
};

// ── Border Radius ────────────────────────────────
export const RADIUS = {
  sm:   "8px",
  md:   "12px",
  lg:   "16px",
  xl:   "20px",
  xxl:  "28px",
  full: "9999px",
};

// ── Spacing ──────────────────────────────────────
export const SPACE = {
  1: "4px",  2: "8px",  3: "12px", 4: "16px",
  5: "20px", 6: "24px", 7: "28px", 8: "32px",
};

// ── Z-index ──────────────────────────────────────
export const Z = {
  bg:      0,
  content: 10,
  header:  20,
  nav:     100,
  overlay: 200,
  modal:   300,
  toast:   400,
};