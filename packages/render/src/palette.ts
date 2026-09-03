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
  rock: "#C7CBD6",
  rockDark: "#3C3F49",
  /** The one thing in the game that goes right: a Simon round answered in
   * full. Nothing else is ever green, which is what makes it read instantly. */
  good: "#3BFF9E",
  /**
   * THE CLASP's shield, and the one deliberate exception to the line above.
   *
   * The rule was put to the owner when this creature was designed — green is
   * the colour reserved for a Simon round answered in full, and an
   * untouchable enemy in it is a direct collision — and the answer was that
   * the collision is acceptable. So it stands, with the distance carried by
   * the hue rather than by the rule: `good` is a bright mint that only ever
   * appears as a flash on the ship's own row, and this is the deep emerald of
   * the hand-painted frames in `assets/gallery/shield/green-shield/`, which
   * only ever appears wrapped around a body up the field. Nothing draws both
   * at once.
   */
  claspShield: "#43C455",
  claspShieldRim: "#B6F5C0",
  goodRim: "#C7FFE4",
  /**
   * The wet film around an eye — THE LID's and THE WARDEN's — and the **third**
   * green in this palette, asked for by name.
   *
   * The rule stated above `good` is that nothing else is ever green, and this
   * is the second exception to it after `claspShield`. It is taken the same
   * way: the distance is carried by the hue and by where each one appears
   * rather than by the rule. `good` is a mint that only ever flashes across the
   * ship's own row; `claspShield` is a deep emerald wrapped round a body up the
   * field; this is a pure neon that only ever pools *around* an eye, under
   * everything else the eye draws. Nothing puts two of them side by side.
   *
   * It is deliberately **not** the eye's own colour any more. The film used to
   * be red or cyan, which made it a fourth thing saying which trigger to load —
   * the lens, the iris and the lit seam between the plates all still say it, so
   * nothing was lost by spending this surface on something that says *alive*
   * instead.
   */
  eyeFluid: "#4CFF4C",
  eyeFluidRim: "#C9FFC9",
  sparkDim: "#8B85AB",
  /**
   * THE WISP's middle band, and the one hue in this palette that is not a
   * thing on the field but the *gap between two of them*.
   *
   * A wisp carries no colour: either shot kills it, and player 2 has to name a
   * tile rather than a trigger. Every other colourless body reaches for `dim`
   * or `rock`, which say "nothing to report" — right for a blip on a strip
   * and wrong for a body somebody has to describe out loud. So this one is
   * drawn through *both* ammunition colours instead, with this violet between
   * them: a body that is visibly cyan on one side and red on the other cannot
   * be said as either, and it says the true thing about the shot as well.
   *
   * Deeper and bluer than `hull`, which is the only other violet here. The
   * hull is an enormous shape along the bottom edge and this is a body the
   * size of a tile up the field; nothing puts them side by side.
   */
  wisp: "#8A4BFF",
  wispRim: "#DCC8FF",
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
