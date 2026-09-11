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
   * at once. The frames themselves are not what the field draws — this swatch
   * is: `drawClaspShield`'s raster branch is reached only behind `?raster=1`,
   * where the shield the owner commissioned is offered beside the shell that
   * ships, and `clasp.ts` says why.
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
  /**
   * THE CHOKE's material, and the argument is `venom`'s a second time: a body
   * on the ship that is nobody's ammunition and no seat's hull. It could not
   * be `venom` itself — a strand that took the cannon in the gum's green
   * would be the gum's word said about a different thing, and the two are
   * the two bodies that stick to the ship. This sits at 64°, a plain bile
   * yellow between the pod's amber at 40° and the venom's green at 85°, and
   * far from the red at 345° and the cyan at 185° a shot is made of; it
   * appears on the strand, on the hull round the cannon while it has it, and
   * on the dead strip — nowhere a shot could be aimed at.
   */
  bile: "#D8E24A",
  bileRim: "#F6F9C0",
  bileDeep: "#6A7212",
  /**
   * THE BALLOON's film, and the one entry in this palette that is **three
   * hues rather than one** — asked for by name, in those words: a nicer
   * colour, and more alien.
   *
   * Every other creature here is a colour, and that is exactly what a balloon
   * may not be. A body carrying an ammunition hue is a body somebody loads a
   * trigger for, and nothing can be fired at this one at all (`sim/balloon.ts`
   * — a bolt is spent on the skin); grey was the old answer to that and it
   * said *nothing to report* about the one arrival two people have to name out
   * loud. So the film is an oil slick: a band of colour that travels round the
   * body and never settles, sweeping the blue-violet at 245 degrees through a
   * magenta at 290 to a rose at 320. **No single hue holds still on it**, which
   * is the whole of why it still cannot be read as "load this" — there is
   * nothing to say.
   *
   * The sweep passes near `arc` at the cold end and `clownNose` at the warm
   * one, and that is accepted rather than dodged: those two are a wall of
   * current across the field and a nose a few pixels wide, and neither is ever
   * a moving band on a body up the field. `sheenDeep` is the ground the film
   * lies on — a near-black violet, so the silhouette holds against the
   * background the way `docs/alive.md` asks a fill to.
   */
  sheenCold: "#5A4BFF",
  sheenMid: "#E04BFF",
  sheenWarm: "#FF57C8",
  sheenRim: "#F3DEFF",
  sheenDeep: "#150E30",
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
  /**
   * THE FENCE's current, and the second hue in this palette that is not a body
   * — a wall of live line across the whole field, which is a hazard rather
   * than a thing anybody shoots.
   *
   * It could not be either ammunition colour and it could not be near one. A
   * pale electric cyan is what lightning actually looks like and it is exactly
   * `cyanRim`, which would put *load cyan* across every column of the field on
   * the one arrival nothing can be fired at — the mistake `clownNose` argues
   * about, at forty times the size. It could not be `rock` either: a grey wall
   * says "nothing to report", and this is the loudest thing on the field.
   *
   * So it sits at 225°, a hard electric blue between `wisp`'s violet at 262°
   * and `cyan` at 186° and touching neither, with a near-white rim for the
   * filament's core. Nothing else in the game is this colour, and the whole of
   * what the pair has to say about one is *where it is not*.
   */
  arc: "#4C7BFF",
  arcRim: "#DCE6FF",
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
