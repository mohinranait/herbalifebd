/**
 * Theme color helpers & pre-defined color palettes for Admin & Storefront.
 */

export interface ThemePalette {
  id: string;
  name: string;
  color: string;
  preview: string;
}

export const PRESET_THEMES: ThemePalette[] = [
  { id: "orange", name: "Herbal Orange", color: "#ff7a00", preview: "bg-[#ff7a00]" },
  { id: "emerald", name: "Emerald Green", color: "#10b981", preview: "bg-[#10b981]" },
  { id: "ocean", name: "Ocean Blue", color: "#2563eb", preview: "bg-[#2563eb]" },
  { id: "teal", name: "Teal Cyan", color: "#00afc7", preview: "bg-[#00afc7]" },
  { id: "rose", name: "Rose Crimson", color: "#f43f5e", preview: "bg-[#f43f5e]" },
  { id: "purple", name: "Royal Violet", color: "#8b5cf6", preview: "bg-[#8b5cf6]" },
  { id: "amber", name: "Amber Gold", color: "#f59e0b", preview: "bg-[#f59e0b]" },
  { id: "slate", name: "Midnight Slate", color: "#0f172a", preview: "bg-[#0f172a]" },
];

/**
 * Adjust hex color brightness by percent (-100 to 100)
 */
export function adjustBrightness(hex: string, percent: number): string {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  if (cleanHex.length !== 6) return hex;

  const num = parseInt(cleanHex, 16);
  const amt = Math.round(2.55 * percent);

  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Convert hex to rgba
 */
export function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  if (cleanHex.length !== 6) return hex;

  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Generate full theme palette variables from a base hex color
 */
export function generateThemeVariables(baseColor: string = "#ff7a00") {
  const brand = baseColor.startsWith("#") ? baseColor : `#${baseColor}`;
  const brandHover = adjustBrightness(brand, -12);
  const brandLight = hexToRgba(brand, 0.08);
  const brandBorder = hexToRgba(brand, 0.35);

  return {
    brand,
    brandHover,
    brandLight,
    brandBorder,
    brandForeground: "#ffffff",
  };
}
