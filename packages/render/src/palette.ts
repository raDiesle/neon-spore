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
  /**
   * The same green with the light off it: THE THROB's armoured half, filled
   * the way `redDark` and `cyanDark` fill a body of their own colour. A deep
   * swatch rather than an alpha over the background, for the reason
   * `docs/alive.md` gives about gradients — a fill that reaches the background
   * opens a hole in a silhouette, and half a silhouette is a different word.
   */
  claspShieldDeep: "#16401F",
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
  /**
   * SNAKE's spit, and the **fourth** green here — asked for by name, in those
   * words: a nice green poison, out of the head, the way it is looking.
   *
   * It is taken the way `claspShield` and `eyeFluid` were, and the distance is
   * carried the same way: by the hue and by where it appears. `good` is a mint
   * that flashes across the ship's own row, `claspShield` a deep emerald
   * wrapped round a body up the field, `eyeFluid` a neon pooled under an eye.
   * This is a yellow-green venom that exists **only inside SNAKE's arena**,
   * which is a screen with no field, no hull and no creature on it at all —
   * there is nothing in that picture for it to be confused with, and the round
   * is over before any of the other three can be on screen again.
   *
   * It is also the one colour in the round that is not the ship's. That is the
   * point of it: everything the body is made of is hull violet and shield
   * cyan, so the thing it *spits* has to be the one thing that is not.
   */
  venom: "#9BE81E",
  venomRim: "#EDFFB4",
  venomDeep: "#3F7A08",
  /**
   * THE VEER's rider's nose, and the newest hue in this palette — asked for by
   * name. The clown was built grey on the argument that every colour here is
   * already spent and a red nose on a rock reads as *shoot me*; the owner's
   * answer was to spend one anyway, because a clown whose nose is stone is not
   * a clown anybody sees.
   *
   * The distance is carried by the hue and by where it appears, the way
   * `claspShield`, `eyeFluid` and `venom` each carry theirs. It is a fuchsia
   * and deliberately **not** a red: `red` is the ammunition at 345°, `ember`
   * the fire at 22° and `pod` the amber at 40°, so a nose in any of the three
   * would be a mark saying "load this" on the one body in the game nothing can
   * be fired at. This sits at 315°, between the hull's violet and that red and
   * touching neither — and it appears nowhere but on a face, at the size of a
   * few pixels, on a creature that arrives one wave in forty.
   */
  clownNose: "#FF4FD8",
  clownNoseRim: "#FFC2F2",
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
