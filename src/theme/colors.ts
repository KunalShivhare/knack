import { common, green, ink, lilac, marigold, mint, paper, rust, sky } from './palette';

/**
 * Semantic colour tokens. Named for the job a colour does, never for the colour
 * itself, so a component reads `colors.text.secondary` and stays correct if the
 * underlying value is retuned.
 *
 * Single fixed theme for now. Dark mode is a second set of these values, not a
 * change to any screen.
 *
 * Paper is the ground, white cards lift off it, ink carries the reading
 * hierarchy, and marigold marks the one thing to do next. Marigold is a fill:
 * anything that has to be read or seen as a line uses `brand.strong` or
 * `text.link` instead. `src/theme/__tests__/contrast.test.ts` holds every pair
 * below to AA.
 */
export const colors = {
  text: {
    primary: ink[900],
    secondary: ink[600],
    /** 5:1 on the canvas and on cards; under AA on the panel, so use secondary there. */
    tertiary: ink[500],
    disabled: ink[300],
    /** For text on the brand fill. Marigold is light, so this is ink, not white. */
    inverse: ink[900],
    onAction: ink[900],
    /** Marigold dark enough to read as text. */
    link: marigold[800],
  },

  surface: {
    /** The app's ground. */
    canvas: paper[50],
    /** Cards and fields, lifted off the canvas by fill and a soft shadow. */
    default: paper[0],
    /** Grouped content that sits in the page rather than on it: practice cards, tiles. */
    panel: paper[100],
    muted: paper[150],
    pressed: paper[150],
    /** Top-to-bottom wash for full-screen scenes: paper, then warming into the panel tone. */
    wash: [paper[50], paper[50], paper[100]],
    /** The bottom end of `wash` at zero alpha, for fading content into it. */
    washBottomClear: 'rgba(244, 238, 226, 0)',
    overlay: 'rgba(42, 31, 26, 0.45)',
  },

  border: {
    /** Decorative hairline. Too faint to be the only sign of a control. */
    default: paper[200],
    subtle: paper[150],
    /** Input outlines and empty markers: 3:1 or better on canvas and cards. */
    strong: ink[300],
    focus: ink[900],
  },

  brand: {
    /** Marigold fill: primary buttons, selected chips, the current marker's centre. */
    default: marigold[400],
    /** The darker edge a primary button stands on. */
    edge: marigold[500],
    /** Brand as a ring or indicator, where 3:1 is needed. */
    strong: marigold[600],
    /** Selected backgrounds and soft halos. */
    tint: marigold[50],
  },

  action: {
    /** Marigold face on a darker edge, ink label — the single primary CTA. */
    primary: marigold[400],
    primaryBorder: marigold[500],
    primaryEdge: marigold[500],
    primaryLabel: ink[900],
    /** White face with a hairline, for anything that is not the CTA. */
    secondary: paper[0],
    secondaryBorder: paper[200],
    secondaryEdge: paper[200],
    secondaryLabel: ink[900],
    disabled: paper[150],
    disabledLabel: ink[500],
  },

  status: {
    success: green[700],
    successBg: green[50],
    /** Struck-out techniques. Rust, not red: striking one out is a choice, not a failure. */
    struck: rust[700],
    struckBg: rust[50],
    error: rust[700],
    errorBg: rust[50],
  },

  /** One tone per lesson medium, keyed by the medium ids the plan contract uses. */
  medium: {
    visual: { bg: sky[50], fg: sky[800] },
    reading: { bg: lilac[50], fg: lilac[800] },
    practice: { bg: mint[50], fg: mint[800] },
  },

  progress: {
    track: paper[200],
    /** Always shown with a written count, so the fill is never the only signal. */
    fill: marigold[400],
    /** Four steps for the practice heatmap, none to a long session. */
    heatmap: [paper[150], marigold[300], marigold[500], rust[700]],
  },

  common,
} as const;

export type Colors = typeof colors;
