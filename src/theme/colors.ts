import { common, neutral } from './palette';

/**
 * Semantic colour tokens. Named for the job a colour does, never for the colour
 * itself, so a component reads `colors.text.secondary` and stays correct if the
 * underlying value is retuned.
 *
 * Single fixed theme — there is no light/dark switch. Every surface is painted
 * explicitly.
 *
 * The palette is monochrome and split 60 / 30 / 10:
 *
 * - **60%** the canvas. `surface.canvas`, an off-white, is the ground almost
 *   every pixel sits on.
 * - **30%** the content layer. White cards on that canvas, their hairline
 *   borders, and the grey text ramp that carries the reading hierarchy.
 * - **10%** near-black. Reserved for the primary button, the selected state and
 *   the filled part of a progress bar — so the one thing to do next is the one
 *   dark shape on the screen.
 *
 * The ratio only holds while near-black stays scarce. A second black button on
 * a screen is the signal that something has been promoted that should not be.
 */
export const colors = {
  text: {
    primary: neutral[950],
    secondary: neutral[600],
    tertiary: neutral[500],
    disabled: neutral[300],
    /** For text on a near-black surface. */
    inverse: neutral[0],
    onAction: neutral[0],
    link: neutral[950],
    /**
     * For small text sitting on the deep end of `surface.wash`. The secondary
     * grey drops to roughly 3.8:1 down there, which is under AA for body sizes.
     */
    onWash: neutral[800],
  },

  surface: {
    /**
     * The app's ground, and the 60%. White rather than an off-white: on a
     * palette with no hue, a grey ground drains the contrast out of everything
     * standing on it and the whole screen reads as switched off.
     */
    canvas: neutral[0],
    /** Cards and fields sitting on the canvas. */
    default: neutral[0],
    subtle: neutral[25],
    muted: neutral[100],
    pressed: neutral[100],
    /** Near-black panel, for the rare block that has to dominate. */
    inverse: neutral[950],
    /**
     * Top-to-bottom wash for full-screen scenes: white through the upper third,
     * then a clear ramp into grey. Holding white behind the headline is what
     * keeps the type crisp while still letting the lower half carry real tone.
     */
    wash: [neutral[0], neutral[0], neutral[300]],
    /** The ends of `wash` at zero alpha, for fading content into it. */
    washTopClear: 'rgba(255, 255, 255, 0)',
    washBottomClear: 'rgba(194, 194, 194, 0)',
    overlay: 'rgba(10, 10, 10, 0.45)',
  },

  border: {
    /** Hairline between a white card and the canvas. */
    default: neutral[150],
    subtle: neutral[100],
    strong: neutral[300],
    focus: neutral[950],
  },

  /**
   * The 10%. There is no brand hue to be had in a monochrome system, so
   * emphasis is carried by near-black against the off-white ground.
   */
  brand: {
    default: neutral[950],
    hover: neutral[800],
    pressed: neutral[950],
    subtle: neutral[100],
    border: neutral[300],
  },

  action: {
    /** Filled near-black pill with a white label — the single primary CTA. */
    primary: neutral[950],
    primaryBorder: neutral[950],
    primaryLabel: neutral[0],
    /** White pill with a hairline border, for anything that is not the CTA. */
    secondary: neutral[0],
    secondaryBorder: neutral[150],
    secondaryLabel: neutral[950],
    disabled: neutral[100],
    disabledLabel: neutral[400],
  },

  /**
   * Status reads through contrast and weight rather than hue. `error` is the
   * darkest step so a failed field still pulls the eye first.
   */
  status: {
    success: neutral[800],
    successBg: neutral[100],
    warning: neutral[800],
    warningBg: neutral[100],
    error: neutral[950],
    errorBg: neutral[100],
    info: neutral[700],
    infoBg: neutral[100],
  },

  /** Progress tokens, named by role so the gamification layer can be restyled. */
  progress: {
    track: neutral[150],
    fill: neutral[950],
    complete: neutral[950],
    /** Four steps for an activity heatmap, lightest to darkest. */
    heatmap: [neutral[150], neutral[400], neutral[700], neutral[950]],
  },

  common,
} as const;

export type Colors = typeof colors;
