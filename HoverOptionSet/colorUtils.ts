/**
 * Small color helpers for working with the hex colors Dataverse stores on choice values.
 * Kept dependency-free so the control does not need Fluent's theming utilities.
 */

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Returns a normalised "#rrggbb" string, or null if the input is not a usable hex color. */
export const normalizeHexColor = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  const match = HEX_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  return `#${hex.toLowerCase()}`;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Relative luminance per WCAG 2.x, in the range 0..1. */
export const relativeLuminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Picks black or white text for the best contrast against the given background. */
export const getContrastText = (backgroundHex: string): string =>
  relativeLuminance(backgroundHex) > 0.4 ? '#1f1f1f' : '#ffffff';

/** Returns the color as an rgba() string with the given alpha, for tinted hover states. */
export const withAlpha = (hex: string, alpha: number): string => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
