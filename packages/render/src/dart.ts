import { type Creature, dartHeading } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * Everything about a dart that is a picture rather than a rule: the lean that
 * says where it is going, the jet that says it is going now, and the arrow
 * player 2 sees and player 1 does not. Where those marks are *placed* — and
 * the dotted legs and the placeholder that go with the arrow — is
 * `dart-path.ts` next door; this file is the marks themselves.
 *
 * The rule itself is one number on the creature — `dartDir`, read through
 * `dartHeading` — and all three of these are drawn off that one call, on
 * purpose. A body leaning left under an arrow pointing right is not a cosmetic
 * defect in this creature, it is the creature broken: the pair would be saying
 * one thing and seeing another, across a voice delay, about a column somebody
 * has to be standing in.
 *
 * **The lean is on both screens and the arrow is on one, and that split is
 * deliberate.** They are not the same statement. The lean is a body under
 * thrust, small and read out of the corner of an eye — it says *something is
 * about to happen*. The arrow is a label, and it says *left*. One is a tell,
 * the other is a word, and the word is the half only player 2 has.
 */

/**
 * How far the body tips while it hangs and takes aim, in radians. Exported
 * because `dart-path.ts` draws the placeholder in a fraction of this pose —
 * an outline leaning at a second, hand-typed angle is an outline the body does
 * not settle into.
 */
export const LEAN_HOLD = 0.3;
/** How far it tips at the deepest point of the run. */
const LEAN_RUN = 0.62;

/**
 * The dart's rotation this instant, on top of its own-motion — positive tips
 * the nose to the right, which is the way `dartHeading` counts.
 *
 * Continuous across both beat boundaries, and that is most of the work here.
 * A dart hangs, aims, goes and levels out; a lean that snapped from one value
 * to another at a beat line would read as the body being *replaced* rather
 * than as one body steering. So the hold eases up from level to full aim over
 * the beat it hangs, and the run leaves at exactly that angle, digs deeper
 * through the middle, and comes back to level as it arrives.
 */
export function dartLean(c: Creature, beatPhase: number): number {
  const dir = dartHeading(c);
  const p = Math.max(0, Math.min(1, beatPhase));
  if (c.dartFloat) {
    // Taking aim: level where the last run left it, full lean by the moment
    // the next one starts.
    return dir * LEAN_HOLD * smoothstep(p);
  }
  // Running: out at the aim, deeper through the middle, level on arrival.
  return dir * (LEAN_HOLD + (LEAN_RUN - LEAN_HOLD) * Math.sin(Math.PI * p)) * (1 - p * p);
}

/**
 * How hard the jet is burning, 0 to 1.
 *
 * Hottest at the instant the run begins, because that is what a thrust *is*
 * here: a dart does not accelerate down the diagonal, it is thrown along it
 * and coasts. A pilot flame lights in the last fifth of the beat it hangs, so
 * the launch has a moment of warning rather than arriving out of a still body
 * — and it is small enough that what it announces is "now", never "which
 * way", which is the arrow's word.
 */
function dartThrust(c: Creature, beatPhase: number): number {
  const p = Math.max(0, Math.min(1, beatPhase));
  if (c.dartFloat) return p < 0.8 ? 0 : ((p - 0.8) / 0.2) * 0.22;
  return (1 - p) ** 1.4;
}

/** The body's own light, and the grey for a dart that somehow carries none. */
export function dartHex(c: Creature): string {
  if (c.color === "red") return PALETTE.red;
  return c.color === "cyan" ? PALETTE.cyan : PALETTE.sparkDim;
}

/**
 * Which way round the body is drawn: mirrored about its own centre when the
 * dart is heading left, so the nose leads either way.
 *
 * A contour is a fixed shape and its point sits on the `+x` end of the long
 * axis (`DART`'s seed is what puts it there). Leaning alone cannot serve both
 * sides — a body tipped the other way has its nose in the air and its fins
 * pointing at the ground — so the shape is flipped and the lean is what the
 * flipped shape is then tipped by. Two lines, and between them the point
 * always leads.
 */
export function dartFlip(c: Creature): number {
  return dartHeading(c) < 0 ? -1 : 1;
}

/**
 * The plume, behind the body along the diagonal it is travelling — up and
 * away from the side it is heading for. Drawn before the body so the contour
 * sits on top of its own exhaust rather than inside it.
 *
 * In the body's own colour, brightening at the root: a jet has to be plainly
 * the same object as the thing it is pushing, or the field grows a second kind
 * of light nobody has a word for. Big enough to be seen at a tile that is
 * thirty-odd pixels wide on a phone, which is the size that decides it — the
 * first version of this was a string of small halos, correct in every value
 * and invisible in the only frame that counts.
 */
export function drawDartJet(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  beatPhase: number,
): void {
  const heat = dartThrust(c, beatPhase);
  if (heat <= 0.01) return;
  const dir = dartHeading(c);
  const r = l.tile * 0.4;
  const hex = dartHex(c);
  // The travel vector spends one column for every row (`DART_COLS` and
  // `DART_ROWS` are equal), so the exhaust runs at 45 degrees back up the
  // other way. Written as the unit diagonal rather than read off those two
  // constants: this is a direction, and they are a distance.
  const bx = -dir * Math.SQRT1_2;
  const by = -Math.SQRT1_2;
  // Across the plume, for the flame's own width.
  const px = -by;
  const py = bx;
  const reach = r * (0.9 + 2.1 * heat);
  const wide = r * 0.5;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // The flame: a tongue from the tail of the body to a point behind it. Filled
  // rather than stroked, so it reads as something being thrown out rather than
  // as an outline being dragged.
  ctx.globalAlpha = 0.42 * heat;
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.moveTo(x + px * wide, y + py * wide);
  ctx.lineTo(x + bx * reach, y + by * reach);
  ctx.lineTo(x - px * wide, y - py * wide);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  // Three soft balls along it, shrinking with distance — the same vocabulary
  // the pod wreck's trail and every other glow in the field is drawn in.
  for (let k = 1; k <= 3; k++) {
    const along = (reach * k) / 3.2;
    halo(ctx, x + bx * along, y + by * along, r * (0.62 - k * 0.11), hex, heat * (0.7 - k * 0.14));
  }
  // The root, right at the tail and near-white: the hottest part of a flame is
  // where it leaves the thing it is pushing.
  halo(ctx, x + bx * r * 0.35, y + by * r * 0.35, r * 0.34 * heat, PALETTE.sparkDim, heat * 0.9);
}

/**
 * Whether this screen carries the arrow, the legs and the placeholder. Player 1
 * never does — that is the whole creature — and `test` does, because it is both
 * seats on one screen and a rig that hid half the picture would be no rig. The
 * same shape `showsLureAlarm` has, and for the same reason.
 *
 * The seat this says no to is not shown nothing: `dart-query.ts` draws two
 * arrows and a question mark there, which is *ask*, and it asks this same
 * question so the two halves can never overlap or both go missing.
 */
export function showsDartArrow(l: Layout): boolean {
  return l.role !== "p1";
}

/**
 * One arrow, above a tile and pointing down the diagonal a move out of that
 * tile takes — down and to the side, never flat. The angle is the statement: "left" from
 * this creature has always meant *down* and left, and an arrow lying flat
 * would be teaching the pair a different word for the same move.
 *
 * In the body's own colour rather than a signal colour, so that what player 2
 * says out loud — "red one, going left" — is two facts read off one mark. The
 * white of `lure-alarm.ts` is spent and must stay spent: that marking means
 * *do not shoot*, and this one is not a warning at all.
 */
export function drawDartArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  dir: number,
  hex: string,
  /** Full weight for the navigator's one arrow; `dart-query.ts` passes less,
   * because its two say "either way" and must not read as two moves. */
  alpha = 0.95,
): void {
  // Above the body and offset toward the side it is going, so the mark is
  // already on the half of the tile the answer is on.
  const cx = x + dir * r * 0.75;
  const cy = y - r * 1.75;
  const len = r * 0.92;
  const ax = dir * Math.SQRT1_2;
  const ay = Math.SQRT1_2;
  ctx.save();
  ctx.strokeStyle = hex;
  ctx.fillStyle = hex;
  ctx.lineWidth = Math.max(1.6, r * 0.14);
  ctx.lineCap = "round";
  ctx.globalAlpha = alpha;

  const tipX = cx + ax * len * 0.5;
  const tipY = cy + ay * len * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - ax * len * 0.5, cy - ay * len * 0.5);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  // The head, drawn rather than typed for `lure-alarm.ts`'s reason: at 26 px a
  // glyph in a font is a smear, and this mark has one beat to be read in.
  const wing = len * 0.42;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - ax * wing - ay * wing * 0.62, tipY - ay * wing + ax * wing * 0.62);
  ctx.lineTo(tipX - ax * wing + ay * wing * 0.62, tipY - ay * wing - ax * wing * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
