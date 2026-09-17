import { colors } from '../colors';

/** WCAG 2.x relative luminance of a #RRGGBB colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** AA for body text, and the floor for rings, borders and other state marks. */
const TEXT = 4.5;
const MARK = 3;

const pairs: [name: string, foreground: string, background: string, minimum: number][] = [
  ['primary text on canvas', colors.text.primary, colors.surface.canvas, TEXT],
  ['secondary text on canvas', colors.text.secondary, colors.surface.canvas, TEXT],
  ['secondary text on panel', colors.text.secondary, colors.surface.panel, TEXT],
  ['secondary text on brand tint', colors.text.secondary, colors.brand.tint, TEXT],
  ['secondary text on success tint', colors.text.secondary, colors.status.successBg, TEXT],
  ['tertiary text on canvas', colors.text.tertiary, colors.surface.canvas, TEXT],
  ['tertiary text on cards', colors.text.tertiary, colors.surface.default, TEXT],
  ['link on canvas', colors.text.link, colors.surface.canvas, TEXT],
  ['label on primary button', colors.action.primaryLabel, colors.action.primary, TEXT],
  ['primary text on brand tint', colors.text.primary, colors.brand.tint, TEXT],
  ['success on canvas', colors.status.success, colors.surface.canvas, TEXT],
  ['white tick on success', colors.common.white, colors.status.success, TEXT],
  ['struck on canvas', colors.status.struck, colors.surface.canvas, TEXT],
  ...Object.entries(colors.medium).map(
    ([medium, tone]): [string, string, string, number] => [`${medium} capsule`, tone.fg, tone.bg, TEXT],
  ),
  ['brand ring on canvas', colors.brand.strong, colors.surface.canvas, MARK],
  ['input border on cards', colors.border.strong, colors.surface.default, MARK],
  ['input border on canvas', colors.border.strong, colors.surface.canvas, MARK],
];

describe('Sketchbook contrast', () => {
  it.each(pairs)('%s', (_name, foreground, background, minimum) => {
    expect(contrast(foreground, background)).toBeGreaterThanOrEqual(minimum);
  });
});
