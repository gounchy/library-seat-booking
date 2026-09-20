const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

function channel(value: number): number {
  const scaled = value / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

/** Độ sáng tương đối theo WCAG 2.x, từ 0 (đen) đến 1 (trắng). */
export function relativeLuminance(color: string): number {
  if (!HEX_PATTERN.test(color)) {
    throw new Error(`Expected a six-digit hex colour, got "${color}".`);
  }
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

/** Tỷ lệ tương phản giữa hai màu, từ 1 (giống nhau) đến 21 (đen trắng). */
export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}