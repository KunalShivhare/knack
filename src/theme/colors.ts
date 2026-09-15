import { accent, base, blue, common, gray, sky, status, streak } from './palette';

/**
 * Semantic colour tokens. Named for the job a colour does, never for the colour
 * itself, so a component reads `colors.text.secondary` and stays correct if the
 * underlying hue is retuned.
 *
 * Single fixed theme — there is no light/dark switch. The app commits to the
 * warm paper look, so every surface is painted explicitly.
 */
export const colors = {
  text: {
    primary: gray[900],
    secondary: gray[600],
    tertiary: gray[500],
    disabled: gray[300],
    inverse: common.white,
    /** Warm near-black. Use on the paper canvas, where pure grey looks cold. */
    ink: base.dark,
    onAction: base.dark,
    link: blue[600],
    highlight: common.highlight,
  },

  surface: {
    /** The learning canvas — the app's default ground. */
    canvas: base.light,
    default: common.white,
    subtle: gray[50],
    muted: gray[100],
    pressed: gray[100],
    overlay: 'rgba(38, 20, 18, 0.45)',
  },

  border: {
    default: gray[200],
    /** Warm border for anything sitting on the canvas. */
    warm: base[200],
    subtle: base[100],
    strong: gray[500],
    focus: blue[600],
  },

  brand: {
    default: blue[400],
    hover: blue[500],
    pressed: blue[600],
    subtle: blue[50],
    border: blue[100],
  },

  action: {
    primary: sky[300],
    primaryBorder: sky[600],
    primaryLabel: base.dark,
    secondary: base.light,
    secondaryBorder: base[300],
    secondaryLabel: base.dark,
    disabled: gray[100],
    disabledLabel: gray[300],
  },

  status: {
    success: status.success,
    successBg: status.successBg,
    warning: status.warning,
    warningBg: status.warningBg,
    error: status.error,
    errorBg: status.errorBg,
    info: status.info,
    infoBg: status.infoBg,
  },

  /**
   * Progress and streak tokens. Named by role so the gamification layer can be
   * restyled without touching component code.
   */
  progress: {
    streakFire: streak.fire,
    streakText: streak.text,
    streakBg: streak.bg,
    streakBorder: streak.border,
    track: base[100],
    fill: blue[400],
    complete: blue[600],
    /** Four steps for an activity heatmap, lightest to darkest. */
    heatmap: [blue[50], blue[100], blue[400], blue[600]],
  },

  /**
   * One colour per kind of learning material. A technique is taught by video,
   * reading, audio, drills or an interactive tool, and the colour is how that
   * reads at a glance in a list.
   */
  media: {
    video: accent.pink,
    videoBg: accent.pinkBg,
    reading: accent.indigo,
    readingBg: accent.indigoBg,
    audio: accent.purple,
    audioBg: accent.purpleBg,
    practice: accent.emerald,
    practiceBg: accent.emeraldBg,
    interactive: accent.cyan,
    interactiveBg: accent.cyanBg,
  },

  common,
} as const;

export type Colors = typeof colors;
export type MediaKind = keyof Pick<
  typeof colors.media,
  'video' | 'reading' | 'audio' | 'practice' | 'interactive'
>;
