import { Colors, type ThemeColor } from '@/constants/theme';
import { contrastRatio } from '@/lib/contrast';

const SCHEMES = ['light', 'dark'] as const;

/** Chữ đặt trên nền: cần tối thiểu 4.5:1 (WCAG AA cho chữ thường). */
const TEXT_PAIRS: [ThemeColor, ThemeColor][] = [
  ['text', 'background'],
  ['text', 'backgroundElement'],
  ['text', 'backgroundSelected'],
  ['textSecondary', 'background'],
  ['textSecondary', 'backgroundElement'],
  ['textSecondary', 'backgroundSelected'],
  ['primary', 'background'],
  ['primary', 'backgroundElement'],
  ['onPrimary', 'primary'],
  ['error', 'background'],
  ['error', 'backgroundElement'],
  ['error', 'backgroundSelected'],
];

describe.each(SCHEMES)('%s colour scheme', (scheme) => {
  const colors = Colors[scheme];

  it.each(TEXT_PAIRS)('%s on %s has a contrast ratio of at least 4.5:1', (foreground, background) => {
    expect(contrastRatio(colors[foreground], colors[background])).toBeGreaterThanOrEqual(4.5);
  });

  it('draws borders with at least 3:1 against the page background', () => {
    expect(contrastRatio(colors.border, colors.background)).toBeGreaterThanOrEqual(3);
  });
});

describe('theme tokens', () => {
  it('defines the same tokens in both schemes', () => {
    expect(Object.keys(Colors.dark).sort()).toEqual(Object.keys(Colors.light).sort());
  });

  it('uses six-digit hex values only', () => {
    for (const scheme of SCHEMES) {
      for (const value of Object.values(Colors[scheme])) {
        expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });
});

describe('contrastRatio', () => {
  it('is 1 for identical colours', () => {
    expect(contrastRatio(Colors.light.text, Colors.light.text)).toBeCloseTo(1);
  });

  it('does not depend on the order of the arguments', () => {
    const forward = contrastRatio(Colors.light.text, Colors.light.background);
    const backward = contrastRatio(Colors.light.background, Colors.light.text);
    expect(forward).toBeCloseTo(backward);
  });

  it('rejects values that are not six-digit hex colours', () => {
    expect(() => contrastRatio('red', Colors.light.text)).toThrow();
  });
});