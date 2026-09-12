import {
  type Creature,
  gripsCreature,
  type World,
  weightPressed,
  weightPressMilli,
} from "@neon-spore/sim";
import { creatureCenter, livingRadius } from "./creature-place.js";
import { glidePhase } from "./depth.js";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE WEIGHT under a thumb, and the one thing on this field a player is shown
 * that their partner is not.**
 *
 * Every other split in this game is a fact about the *world* kept from one seat:
 * a wisp is drawn on one screen, a veil's colour on the other, a dart's next
 * side, a fence's gaps. This is a split in what a player's own *hand* looks
 * like, and it is the only one — a thumb on a weight brightens it here and on
 * nothing the other phone draws.
 *
 * **The contrast with THE BALLOON is the design.** A balloon's two handles are
 * drawn on both screens, the other seat's in `PALETTE.dim`, precisely so each
 * player can read a thumb they cannot see — and what the pair says out loud
 * there is *which balloon*. Here the other seat's hand is not dimmed, it is
 * **absent**, so there is nothing to read and nothing to infer. What is left to
 * say is *now*, and there is no way to say it except out loud.
 *
 * **The squeeze is shared, and only the squeeze.** Once both hands are on the
 * body the press is a fact about the world rather than about a thumb — it is
 * counting, and it is about to give — so both screens draw it closing. That is
 * the pair's reward for having landed together and the only confirmation either
 * of them gets; it arrives *after* the commitment, never before it, which is
 * what keeps the count honest.
 */

/** How far in the calipers travel by the time the press is full, as a share of
 * the body's radius. Enough to read as pressure at arm's length on a phone. */
const BITE = 0.34;

/**
 * Whose hand this screen is allowed to show. The rig is both seats at once,
 * which is what makes a two-seat control drawable in one frame for a test — and
 * here it is also the only way to see both halves of the split in one picture.
 */
export function pressSeats(role: Layout["role"]): (1 | 2)[] {
  if (role === "test") return [1, 2];
  return [role === "p1" ? 1 : 2];
}

/**
 * Whether this screen draws the private mark under a thumb — **this seat's own
 * hand on this body, and the other seat not on it too**.
 *
 * A predicate rather than a branch buried in the draw, so the claim the creature
 * rests on is one a test can ask directly: `showsOwnMark` is true for the seat
 * pressing and false for the seat watching, and that difference is the whole
 * mechanic (`weight.test.ts` next door in render).
 */
export function showsOwnMark(l: Layout, world: World, c: Creature): boolean {
  if (c.kind !== "weight" || weightPressed(world, c)) return false;
  return pressSeats(l.role).some((seat) => gripsCreature(world, seat, c.id));
}

export function drawWeightPress(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  for (const c of world.creatures) {
    if (c.kind !== "weight") continue;
    drawOne(ctx, l, world, c, beatPhase, time);
  }
}

function drawOne(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  beatPhase: number,
  time: number,
): void {
  const both = weightPressed(world, c);
  const mine = showsOwnMark(l, world, c);
  if (!both && !mine) return;

  const at = creatureCenter(l, c, glidePhase(world.cfg, world.beat, c, beatPhase));
  const r = livingRadius(l.tile, 1);

  if (!both) {
    // **One hand: a ring under the thumb, and nothing else in the world knows.**
    // It breathes rather than closes, because nothing is happening — a mark that
    // crept inward would be a promise of progress this press is not making, and
    // a player who read it as one would stop calling the beat.
    const breath = 1 + 0.04 * Math.sin(time * 4);
    const ring = new Path2D();
    ring.arc(at.x, at.y, r * 0.92 * breath, 0, Math.PI * 2);
    strokeGlow(ctx, ring, PALETTE.rock, STROKE.inner, 0.7);
    return;
  }

  // **Both hands: the calipers close.** Two arcs, top and bottom, walking in
  // with the press and brightening as they go, so the last quarter-beat before
  // it gives is the loudest thing in the lane.
  const press = weightPressMilli(world, c) / 1000;
  const inset = r * BITE * press;
  for (const side of [-1, 1] as const) {
    const arc = new Path2D();
    const y = at.y + side * (r - inset);
    const span = r * (0.72 + 0.2 * press);
    arc.moveTo(at.x - span, y);
    arc.quadraticCurveTo(at.x, y + side * r * 0.22, at.x + span, y);
    strokeGlow(ctx, arc, PALETTE.text, STROKE.inner, 0.8 + 0.6 * press);
  }
  // And the seam the pressure is finding, across the middle: a thin line that
  // only exists while the body is being held, growing with the press.
  const seam = new Path2D();
  const reach = r * 0.5 * press;
  seam.moveTo(at.x - reach, at.y);
  seam.lineTo(at.x + reach, at.y);
  strokeGlow(ctx, seam, PALETTE.text, STROKE.inner, 0.5 + press);
}
