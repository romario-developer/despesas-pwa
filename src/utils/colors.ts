const normalizeHex = (value: string) => {
  const trimmed = value.trim().replace("#", "");
  if (trimmed.length === 3) {
    return trimmed
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }
  if (trimmed.length === 6) {
    return trimmed;
  }
  return null;
};

const hexToRgb = (value: string) => {
  const normalized = normalizeHex(value);
  if (!normalized) return null;
  const num = Number.parseInt(normalized, 16);
  if (Number.isNaN(num)) return null;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return { r, g, b };
};

export const getReadableTextColor = (hex: string) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#0f172a";
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq >= 160 ? "#0f172a" : "#ffffff";
};
