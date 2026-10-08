import type { Point } from "@neon-spore/content";
import {
  type CapstanState,
  capstanBand,
  capstanFace,
  capstanRubAsks,
  capstanSteerAsks,
  type SimConfig,
} from "@neon-spore/sim";
import { capstanArrived, capstanGone, capstanTurn } from "./capstan-pose.js";
import {
  capstanAt,
  capstanCoreR,
  capstanFaceAt,
  capstanOnScreen,
  capstanSize,
  capstanSqueeze,
} from "./capstan-shape.js";
import { onlySeat } from "./desk-seat.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The bands on THE CAPSTAN** — the hands lane that makes the drum answer a
 * thumb at all (§11.54, `bosses-choreographed.md` §37).
 *
 * Its own page for `rime-grip.ts`' reason: the drum a thumb is answered
 * on is the one `drawCapstan` puts on the screen this frame — dropped in as it
 * arrives, rolled in its cradle by the pull — and all this file adds is
 * *which* part of it a press is on.
 *
 * **Either end, on either screen, takes a rub.** Which seat wears is the lit
 * step's and which face is bared is the other seat's pull, so both are the
 * simulation's to settle (`capstan-hand.ts`): a thumb on the end that has not
 * come round yet rubs nothing until it does, and then its fresh reversals
 * count — a wearer may be down on the band before the steerer has it there.
 * The turns are counted by the host (`rub.ts`, `rub-turns.ts`).
 *
 * **The middle takes the pull**: a press on the drum between its ends, or
 * on the cradle under it, is a steering thumb, and what it says is how far
 * across it has carried since it went down (`touch-drag.ts`) — held past the
 * mark to keep a face bared, let go to let the cradle drift back and pause
 * the rub. It was the phone's lean until 27 September 2026, when the owner
 * ruled that no wave may need a tilt sensor.
 */

/** How far past a face's half-height a thumb is still on its band, in tiles. */
const REACH = 0.35;

/** How far under the drum's half-height the cradle reaches, in tiles: its saddle and a little of the post. */
const CRADLE = 1.3;

/** Whether the drum is there to be touched: every phase but the spent one. */
export function capstanTakesHand(s: CapstanState): boolean {
  return s.phase !== "open";
}

/**
 * Where point `p` of the drum stands on the screen this frame — dropped in,
 * lifted away and rolled in its cradle as `drawCapstan` has it. The cue reads
 * its words' places off this too (`boss-cue-read-zl.ts`).
 */
export function capstanScreenAt(
  l: Layout,
  cfg: SimConfig,
  s: CapstanState,
  p: Point,
  beat: number,
  beatPhase: number,
): Point {
  const turn = capstanTurn({ cfg }, s);
  const at = capstanAt(l, cfg, capstanArrived(s, cfg, beat, beatPhase));
  const gone = capstanGone(s, cfg, beat, beatPhase);
  return capstanOnScreen(l, at, gone, turn, p);
}

/** End `side`'s middle this frame, in canvas pixels, and how far round it a press is on it. */
function endAt(
  l: Layout,
  cfg: SimConfig,
  s: CapstanState,
  side: 0 | 1,
  beat: number,
  beatPhase: number,
): Circle {
  const face = capstanFaceAt(l, side, capstanSqueeze(capstanTurn({ cfg }, s)));
  const p = capstanScreenAt(l, cfg, s, face, beat, beatPhase);
  return { x: p.x, y: p.y, r: capstanSize(l).ry + REACH * l.tile };
}

/**
 * A press on either end of the drum: a rubbing thumb, held and **saying
 * nothing** — what it says is counted once it is down. `bossOf(field,
 * "capstan")` is `null` on every wave without it.
 */
export function capstanRubUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "capstan");
  if (s === null || !capstanTakesHand(s)) return null;
  const ends = ([0, 1] as const).map((side) =>
    endAt(l, field.cfg, s, side, field.beat, field.beatPhase),
  );
  if (!ends.some((e) => Math.hypot(x - e.x, y - e.y) <= e.r)) return null;
  const seat = field.seat;
  return {
    player: seat,
    command: null,
    hold: { kind: "drag", target: "capstanRub", player: seat, originX: x, originY: y, rub: true },
  };
}

/**
 * A press on the drum's middle or its cradle, and on neither end: a steering
 * thumb, held and saying nothing until it moves. Either seat may take it;
 * which one steers is the lit step's (`capstan-hand.ts`).
 */
export function capstanSteerUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "capstan");
  if (s === null || !capstanTakesHand(s)) return null;
  const { cfg, beat, beatPhase } = field;
  const ends = ([0, 1] as const).map((side) => endAt(l, cfg, s, side, beat, beatPhase));
  if (ends.some((e) => Math.hypot(x - e.x, y - e.y) <= e.r)) return null;
  const c = capstanSteerStanding(l, cfg, s, beat, beatPhase);
  const { rx, ry } = capstanSize(l);
  const dy = y - c.y;
  if (Math.abs(x - c.x) > rx || dy < -(ry + REACH * l.tile) || dy > ry + CRADLE * l.tile) {
    return null;
  }
  const seat = field.seat;
  return {
    player: seat,
    command: null,
    hold: { kind: "drag", target: "capstanSteer", player: seat, originX: x, originY: y },
  };
}

/**
 * The drum's middle as a circle where it stands this frame — where the ghost
 * thumb for the pull goes down, and what `handleCircle` answers for it.
 */
export function capstanSteerStanding(
  l: Layout,
  cfg: SimConfig,
  s: CapstanState,
  beat: number,
  beatPhase: number,
): Circle {
  const p = capstanScreenAt(l, cfg, s, { x: 0, y: 0 }, beat, beatPhase);
  return { x: p.x, y: p.y, r: capstanSize(l).ry };
}

/**
 * The core as a circle where it stands this frame, at the drum's middle —
 * what a shot is fired at once it is bared, and the circle the cue's
 * crosshair rides (`boss-cue-read-zl.ts`).
 */
export function capstanCoreStanding(
  l: Layout,
  cfg: SimConfig,
  s: CapstanState,
  beat: number,
  beatPhase: number,
): Circle {
  const p = capstanScreenAt(l, cfg, s, { x: 0, y: 0 }, beat, beatPhase);
  return { x: p.x, y: p.y, r: capstanCoreR(l) };
}

/**
 * The end a thumb is wanted on, as a circle where it stands this frame —
 * which is where the ghost thumb stands, what `handleCircle` answers and
 * where the word goes: the bared face, or the one the lit band asks for, or
 * the pilot's on a hold nobody has pulled yet.
 */
export function capstanRubStanding(
  l: Layout,
  cfg: SimConfig,
  s: CapstanState,
  beat: number,
  beatPhase: number,
): Circle {
  const side = capstanFace({ cfg }, s) ?? capstanBand(s) ?? 0;
  return endAt(l, cfg, s, side, beat, beatPhase);
}

/**
 * **Whose a desk press on the drum is** (`desk-grab.ts` `markSeat`): an end
 * the wearing seat's, the middle and the cradle the steering seat's, each
 * when the lit step names one. Either seat's press answers both, so the test
 * screen's mouse was the pilot's everywhere, and on a right band neither the
 * navigator's steer nor, on a left, the navigator's rub could be reached.
 */
export function capstanGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "capstan");
  if (s === null) return undefined;
  const world = { cfg: field.cfg };
  const side = (seat: 1 | 2): 0 | 1 => (seat === 1 ? 0 : 1);
  if (capstanRubUnder(l, x, y, field) !== null) {
    return onlySeat((seat) => capstanRubAsks(world, s, side(seat)));
  }
  if (capstanSteerUnder(l, x, y, field) !== null) {
    return onlySeat((seat) => capstanSteerAsks(world, s, side(seat)));
  }
  return undefined;
}
