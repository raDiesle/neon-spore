/** The style guide, as values. Nothing here is decided in a component. */
export const PALETTE = {
  background: "#07060F",
  grid: "#241B4F",
  gridBeat: "#3A3160",
  hull: "#FFC24B",
  hullRim: "#FFF3D0",
  shield: "#2FE0F0",
  shieldRim: "#BFF6FF",
  text: "#F2E9DC",
  dim: "#7A6FA8",
  red: "#FF3B6B",
  redRim: "#FF8AA3",
  redDark: "#190F2C",
  cyan: "#2FE0F0",
  cyanRim: "#BFF6FF",
  cyanDark: "#0F2E38",
  rock: "#C7CBD6",
  rockDark: "#3C3F49",
  sparkDim: "#8B85AB",
} as const;

/**
 * Line weights from the style guide, in CSS pixels at 26 px object size.
 * Glow comes from a soft aura around the line, never from a thicker line.
 */
export const STROKE = {
  outline: 1.6,
  inner: 0.8,
  glowPasses: 3,
  glowSpread: 5,
} as const;
