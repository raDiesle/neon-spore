import { type SimConfig, type TrivetState, trivetDone, type World } from "@neon-spore/sim";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { trivetArrived, trivetFootLift } from "./trivet-pose.js";
import { type Point, trivetCentre, trivetDrop, trivetFoot, trivetHubR } from "./trivet-shape.js";

/**
 * **The pads on THE TRIVET** — the first of its hands lanes, and the one that
 * makes the stand answer a hand at all (§11.47, `bosses-choreographed.md` §30).
 *
 * Its own page for `vise-grip.ts`' reason: the stand a finger is answered on
 * is the one `drawTrivet` puts on the screen this frame, at the same middle
 * and the same drop into frame, and all this file adds is *whether* a press
 * is one finger of a chord.
 *
 * **Geometry says whose foot is whose, on both phones.** The front foot,
 * splayed left, is Player 1's and the rear, splayed right, Player 2's
 * (`sim/trivet-hand.ts`); both screens draw the whole stand, and a finger on
 * the other seat's side falls through to whatever is behind it, as the
 * simulation would refuse it anyway.
 *
 * **A pad is pressed in its zone, not on its socket.** The sockets are a
 * fifth of a tile across and a third of one apart — a chord of three would
 * be three fingertips on a centimetre of glass. The zone is THE VISE's: this
 * seat's side of the hub, the width of the field, from the hub's crown to
 * below the feet. Which pad a finger is, is the order it landed in, counted
 * by whoever owns the pointers (`chord.ts`): the lit sockets say how many
 * fingers to put down, never where.
 *
 * **The stand takes a chord whenever it stands**, from the drop into frame
 * until it collapses: the simulation records a pad whenever the stand is
 * present, so a chord already down when a step lights is counted from its
 * first beat.
 */

/** Half a tile of zone above the hub's crown. */
const ABOVE = 0.5;
/** And a tile below the planted feet, so a thumb under its foot is not refused on a pixel. */
const BELOW = 1;

/** Whether the stand is there to be pressed: every phase but the collapse. */
export function trivetTakesChord(s: TrivetState): boolean {
  return !trivetDone(s);
}

/** A seat's side of the hub: the pilot's the left, the navigator's the right. */
export function trivetSide(seat: 1 | 2): -1 | 1 {
  return seat === 1 ? -1 : 1;
}

/** The hub's middle where it stands this frame, lifted while it is still dropping in. */
function hubAt(l: Layout, cfg: SimConfig, s: TrivetState, beat: number, beatPhase: number): Point {
  const home = trivetCentre(l, cfg);
  return { x: home.x, y: home.y - trivetDrop(l, trivetArrived(s, cfg, beat, beatPhase)) };
}

/**
 * A seat's foot as a circle, as it stands this frame — swung up, or planted —
 * which is where the ghost thumb stands and what `handleCircle` answers. The
 * press is taken on the whole zone (`trivetPadUnder`); this is the foot it
 * names.
 */
export function trivetFootStanding(
  l: Layout,
  world: World,
  s: TrivetState,
  seat: 1 | 2,
  beatPhase: number,
): Circle {
  const side = seat === 1 ? 0 : 1;
  const at = hubAt(l, world.cfg, s, world.beat, beatPhase);
  const lift = trivetFootLift(world, s, side, world.beat, beatPhase);
  const foot = trivetFoot(l, side, lift, 0);
  return { x: at.x + foot.x, y: at.y + foot.y, r: trivetHubR(l) };
}

/**
 * A press in this seat's zone: one finger of a chord on its foot, held and
 * **saying nothing** — which pad it is, is counted once it is down
 * (`chord.ts`). `bossOf(field, "trivet")` is `null` on every wave without
 * it. The hub's own middle is either seat's, so a finger laid dead centre is
 * never refused on a pixel.
 */
export function trivetPadUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "trivet");
  if (s === null || !trivetTakesChord(s)) return null;
  const at = hubAt(l, field.cfg, s, field.beat, field.beatPhase);
  const top = at.y - trivetHubR(l) - ABOVE * l.tile;
  const bottom = at.y + trivetFoot(l, 0, 0, 0).y + BELOW * l.tile;
  if (y < top || y > bottom) return null;
  if (x < l.gridLeft || x > l.gridLeft + l.gridWidth) return null;
  const seat = field.seat;
  if ((x - at.x) * trivetSide(seat) < 0) return null;
  const target = seat === 1 ? "trivetPadFront" : "trivetPadRear";
  return {
    player: seat,
    command: null,
    hold: { kind: "drag", target, player: seat, originX: x, originY: y, chord: true },
  };
}
