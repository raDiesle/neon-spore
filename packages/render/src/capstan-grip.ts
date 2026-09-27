import type { Point } from "@neon-spore/content";
import { type CapstanState, capstanBand, capstanFace, type SimConfig } from "@neon-spore/sim";
import { capstanArrived, capstanGone, capstanTurn } from "./capstan-pose.js";
import {
  capstanAt,
  capstanFaceAt,
  capstanOnScreen,
  capstanSize,
  capstanSqueeze,
} from "./capstan-shape.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The bands on THE CAPSTAN** — the hands lane that makes the drum answer a
 * thumb at all (§11.54, `bosses-choreographed.md` §37).
 *
 * Its own page for `grindstone-grip.ts`' reason: the drum a thumb is answered
 * on is the one `drawCapstan` puts on the screen this frame — dropped in as it
 * arrives, rolled in its cradle by the lean — and all this file adds is
 * *which* end a press is on.
 *
 * **Either end, on either screen, takes a rub.** Which seat wears is the lit
 * step's and which face is bared is the other seat's lean, so both are the
 * simulation's to settle (`capstan-hand.ts`): a thumb on the end that has not
 * come round yet rubs nothing until it does, and then its fresh reversals
 * count — a wearer may be down on the band before the steerer has it there.
 * The turns are counted by the host (`rub.ts`, `rub-turns.ts`).
 *
 * **The lean is never a hand on the glass**: `capstanLean` goes out from the
 * phone's own tilt (`apps/game/src/lean.ts`).
 */

/** How far past a face's half-height a thumb is still on its band, in tiles. */
const REACH = 0.35;

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
 * The end a thumb is wanted on, as a circle where it stands this frame —
 * which is where the ghost thumb stands, what `handleCircle` answers and
 * where the word goes: the bared face, or the one the lit band asks for, or
 * the pilot's on a hold nobody has leant into yet.
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
