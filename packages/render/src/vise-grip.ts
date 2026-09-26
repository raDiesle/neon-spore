import { type SimConfig, type ViseState, viseDone, type World } from "@neon-spore/sim";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { viseArrived } from "./vise-pose.js";
import { viseCentre, viseLift, viseRadius } from "./vise-shape.js";

/**
 * **The pinch on THE VISE** — the first of its hands lanes, and the one that
 * makes the case answer a hand at all (§11.45).
 *
 * Its own page for `oculus-grip.ts`' reason: the case a finger is answered on
 * is the one `drawVise` puts on the screen this frame, at the same middle and
 * the same drop into frame, and all this file adds is *whether* a press is
 * one finger of a pinch.
 *
 * **Geometry says whose lobe is whose, on both phones.** The left lobe is
 * Player 1's and the right Player 2's (`sim/vise-hand.ts`), both screens draw
 * the whole case, and a finger on the other seat's side falls through to
 * whatever is behind it, as the simulation would refuse it anyway.
 *
 * **A lobe is pinched in its zone, not on its shell.** The shell is a tile
 * wide — six millimetres on a phone — and a pinch is two fingertips landing
 * apart and closing, so two of them never fit on it. §28 draws the pinch
 * zones as THE MANTLE's screen halves, and that is what a press is taken on:
 * this seat's side of the spine, the width of the field, over the rows the
 * case stands in and half a tile either way. A finger that lands there is one
 * finger of this seat's pinch; the pair is whoever owns the pointers'
 * (`pinch.ts`), and a finger that wanders out of the zone after the press
 * still counts, because the lift is what lets go.
 *
 * **The case takes a pinch whenever it stands**, from the drop into frame
 * until it splits: the simulation records a gap whenever the case is present,
 * so a pinch already shut when a seam lights is counted from its first beat.
 */

/** Half a tile of zone above and below the case, so a finger at its tip is not refused on a pixel. */
const MARGIN = 0.5;

/** Whether the case is there to be pinched: every phase but the split. */
export function viseTakesPinch(s: ViseState): boolean {
  return !viseDone(s);
}

/** A seat's side of the spine: the pilot's the left, the navigator's the right. */
export function viseSide(seat: 1 | 2): -1 | 1 {
  return seat === 1 ? -1 : 1;
}

/** The case's middle where it stands this frame, lifted while it is still dropping in. */
function caseAt(l: Layout, cfg: SimConfig, s: ViseState, beat: number, beatPhase: number) {
  const home = viseCentre(l, cfg);
  return { x: home.x, y: home.y - viseLift(l, viseArrived(s, cfg, beat, beatPhase)) };
}

/**
 * A seat's lobe as a circle: the round in the middle of that half-shell, which
 * is where the ghost thumb stands and what `handleCircle` answers. The press
 * is taken on the whole zone (`viseLobeUnder`); this is the lobe it names.
 */
export function viseLobeCircle(
  l: Layout,
  cfg: SimConfig,
  s: ViseState,
  seat: 1 | 2,
  beat: number,
  beatPhase: number,
): Circle {
  const at = caseAt(l, cfg, s, beat, beatPhase);
  const { rx } = viseRadius(l);
  return { x: at.x + (viseSide(seat) * rx) / 2, y: at.y, r: rx / 2 };
}

/** The same for the world as it stands, for the placement and the ghost hand. */
export function viseLobeStanding(
  l: Layout,
  world: World,
  s: ViseState,
  seat: 1 | 2,
  beatPhase: number,
): Circle {
  return viseLobeCircle(l, world.cfg, s, seat, world.beat, beatPhase);
}

/**
 * A press in this seat's pinch zone: one finger of a pinch on its lobe, held
 * and **saying nothing** — a finger alone is not a pinch, and the gap goes out
 * once a second finger is down in the same zone (`pinch.ts`).
 * `bossOf(field, "vise")` is `null` on every wave without it. The spine itself
 * is either seat's, so a finger laid dead centre is never refused on a pixel.
 */
export function viseLobeUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "vise");
  if (s === null || !viseTakesPinch(s)) return null;
  const at = caseAt(l, field.cfg, s, field.beat, field.beatPhase);
  const reach = viseRadius(l).ry + MARGIN * l.tile;
  if (Math.abs(y - at.y) > reach) return null;
  if (x < l.gridLeft || x > l.gridLeft + l.gridWidth) return null;
  const seat = field.seat;
  if ((x - at.x) * viseSide(seat) < 0) return null;
  const target = seat === 1 ? "viseLobeLeft" : "viseLobeRight";
  return {
    player: seat,
    command: null,
    hold: { kind: "drag", target, player: seat, originX: x, originY: y, pinch: true },
  };
}
