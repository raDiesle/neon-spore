import type { DragTarget, HalterState, SimConfig } from "@neon-spore/sim";
import { halterGripAsks, halterLitStep } from "@neon-spore/sim";
import { onlySeat } from "./desk-seat.js";
import { halterArrived, halterLitSegment } from "./halter-pose.js";
import { halterAt, halterCoreAt, halterCoreR, halterGripAt, halterGripR } from "./halter-shape.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The grips on THE HALTER** — the hands lane that makes the seam answer a
 * thumb at all (§11.53, `bosses-choreographed.md` §36).
 *
 * Its own page for `trivet-grip.ts`' reason: the grips a thumb is answered on
 * are the ones `drawHalter` puts on the screen this frame, on the lit
 * segment's seam, at the same drop into frame, and all this file adds is
 * *which* of the two a press is on.
 *
 * **Either seat, on both phones.** Unlike THE TRIVET's feet, nothing here is
 * split by geometry: which seat rests and which grips is the step's, not the
 * seat's (`sim/halter.ts`), so a press is signed with the seat whose screen it
 * landed on and the simulation decides what it means. A resting seat's thumb
 * on a grip is taken like any other, and it is heard as the stir it is.
 *
 * **A press is whichever grip it is nearer**, out to `REACH`. The grips are a
 * quarter of a tile across and just over a tile apart, so the reach is wider
 * than the drawn grip: a thumb over one lands in its circle, never on a pixel.
 *
 * **A grip is a finger of a chord** (`chord.ts`), flagged so the press, its
 * wander and its lift say nothing on their own: the host that owns the
 * pointers (`chord-pads.ts`) says the grip down as it lands and up as it
 * lifts, one drag each. So two thumbs on the two grips go out as two drags
 * and a thumb lifted as one. The simulation keeps a grip as a level, so a
 * second thumb on a grip already held adds nothing, and lifting either of the
 * two lets it go.
 *
 * **Only while a grip is drawn**: a rest-and-chord step lit. Between steps and
 * on a shot there is nothing to press; a thumb already down stays captured
 * and says its lift whenever it comes.
 */

/** How far from a grip a thumb is still on it, in tiles. */
const REACH = 0.9;

/** The two grips, the left one first, as the simulation names them. */
const TARGETS = ["halterChordLeft", "halterChordRight"] as const satisfies readonly DragTarget[];

type Side = 0 | 1;

/** The lit segment whose grips are drawn, or null while none is. */
function gripped(s: HalterState): 0 | 1 | 2 | null {
  const step = halterLitStep(s);
  if (step === null || step.ask === "fire") return null;
  return halterLitSegment(s);
}

/**
 * Grip `side` of the lit segment as a circle, where it stands this frame —
 * dropped in as the seam arrives. Null while no grip is drawn. What the ghost
 * thumb stands on and what `handleCircle` answers; the press is taken out to
 * `REACH` round it (`halterGripUnder`).
 */
export function halterGripStanding(
  l: Layout,
  cfg: SimConfig,
  s: HalterState,
  side: Side,
  beat: number,
  beatPhase: number,
): Circle | null {
  const k = gripped(s);
  if (k === null) return null;
  const at = halterAt(l, cfg, halterArrived(s, cfg, beat, beatPhase));
  const grip = halterGripAt(l, k, side);
  return { x: at.x + grip.x, y: at.y + grip.y, r: halterGripR(l) };
}

/**
 * The core as a circle where it stands this frame, in the middle segment's
 * crack — what a shot is fired at, and the circle the cue's crosshair rides
 * (`boss-cue-read-zk.ts`).
 */
export function halterCoreStanding(
  l: Layout,
  cfg: SimConfig,
  s: HalterState,
  beat: number,
  beatPhase: number,
): Circle {
  const at = halterAt(l, cfg, halterArrived(s, cfg, beat, beatPhase));
  const core = halterCoreAt(l);
  return { x: at.x + core.x, y: at.y + core.y, r: halterCoreR(l) };
}

/** Which target a grip is. */
export function halterGripTarget(side: Side): (typeof TARGETS)[number] {
  return TARGETS[side];
}

/**
 * A press on a lit grip: one finger of this seat's chord, held and **saying
 * nothing** — what it says is counted once it is down (`chord.ts`).
 * `bossOf(field, "halter")` is `null` on every wave without it.
 */
export function halterGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "halter");
  if (s === null) return null;
  let best: { side: Side; d: number } | null = null;
  for (const side of [0, 1] as const) {
    const grip = halterGripStanding(l, field.cfg, s, side, field.beat, field.beatPhase);
    if (grip === null) return null;
    const d = Math.hypot(x - grip.x, y - grip.y);
    if (d <= REACH * l.tile && (best === null || d < best.d)) best = { side, d };
  }
  if (best === null) return null;
  const seat = field.seat;
  return {
    player: seat,
    command: null,
    hold: {
      kind: "drag",
      target: halterGripTarget(best.side),
      player: seat,
      originX: x,
      originY: y,
      chord: true,
    },
  };
}

/**
 * **Whose a desk press on a grip is** (`desk-grab.ts` `markSeat`): the seat
 * the lit step asks to chord — the pilot on the left, the navigator on the
 * right, either on a guard until one has a grip down. Both seats' presses
 * answer a grip, so the test screen's mouse was the pilot's on a right step,
 * which is the rester stirring and the pair startled.
 */
export function halterGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "halter");
  if (s === null || halterGripUnder(l, x, y, field) === null) return undefined;
  return onlySeat((seat) => halterGripAsks(s, seat === 1 ? 0 : 1));
}
