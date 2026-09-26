import { CREATURE_HUES } from "./palette-creatures.js";

/** The style guide, as values. Nothing here is decided in a component. */
export const PALETTE = {
  background: "#07060F",
  grid: "#241B4F",
  gridBeat: "#3A3160",
  hull: "#C05CFF",
  hullRim: "#F4E7FF",
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
  pod: "#FFC24A",
  podRim: "#FFF0C2",
  podDark: "#2C1C05",
  ember: "#FF7A2F",
  /** The rim `ember` never had. Every other hue here carries one and this
   * one did not, because until the intro nothing outlined an ember shape —
   * a spark is a filled dot. Added rather than derived in a component: a
   * colour decided next to a `fillStyle` is a colour nobody can find. */
  emberRim: "#FFC7A0",
  rock: "#C7CBD6",
  rockDark: "#3C3F49",
  /** The one thing in the game that goes right: a Simon round answered in
   * full. Nothing else is ever green, which is what makes it read instantly. */
  good: "#3BFF9E",
  goodRim: "#C7FFE4",
  sparkDim: "#8B85AB",
  ...CREATURE_HUES,
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
