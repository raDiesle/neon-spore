import {
  type KeelState,
  keelBreathing,
  keelCooling,
  keelFlipping,
  keelLit,
  keelSeat,
  NO_JOINT,
  type SimConfig,
} from "@neon-spore/sim";
import { keelRingCircle } from "./keel-marks.js";
import { keelSegs } from "./keel-pose.js";
import { keelEndCircle } from "./keel-story.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { NO_SPAN, type SlowSpan } from "./slow-hush.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The thumb on THE KEEL** — the first of its hands lanes, and the one that
 * makes the spine answer a hand at all (§11.41).
 *
 * Its own page for `spool-grip.ts`' reason: the ring a finger is answered in
 * is the one `drawKeelRing` draws, round the segment `keelSegs` puts on the
 * screen this frame, and all this file adds is *whether* the tap counts.
 *
 * **Either seat's tap on the ring is taken.** Whose joint it is is where it
 * sits, left half or right (`sim/keel.ts` `keelSeat`), and the simulation
 * refuses the other seat silently (`sim/keel-hand.ts`). Swallowing that tap
 * here rather than passing it to the cannon behind is MANTLE's core's rule: a
 * thumb on the ring meant the ring, and a pair find out whose joint it was by
 * watching whose tap counted — never by a shot they did not mean.
 *
 * **Only a lit joint has a ring**, with two more: **in the flip**, each seat's
 * own end joint (`keelEndSeg`), held down rather than tapped — the lift sends
 * `on: false`, which is the thumb coming up; and **in the breath and the
 * cooldown**, every segment, since any tap on the held spine is the reflex
 * that stirs or flares it.
 * Everywhere else a tap there is the cannon's.
 */

/** The ring round the lit joint, where it stands this frame, or `null` when no joint is lit. */
export function keelJointCircle(
  l: Layout,
  cfg: SimConfig,
  s: KeelState,
  beat: number,
  beatPhase: number,
  slow: SlowSpan = NO_SPAN,
): Circle | null {
  if (!keelLit(s) || s.joint === NO_JOINT) return null;
  const seg = keelSegs(l, cfg, s, beat, beatPhase, slow)[s.joint];
  return seg === undefined ? null : keelRingCircle(l, seg.centre);
}

/**
 * A tap inside the lit joint's ring, from either seat. `bossOf(field, "keel")`
 * is `null` on every wave without the spine. The tap is momentary: the
 * simulation locks the segment on the press, and the lift sends nothing it
 * reads.
 */
export function keelJointUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "keel");
  if (s === null) return null;
  if (!keelTakes(l, field, s, field.seat, x, y)) return null;
  const seat = field.seat;
  return {
    player: seat,
    command: { kind: "drag", target: "keelJoint", on: true, fromMilli: 0 },
    hold: { kind: "drag", target: "keelJoint", player: seat, originX: x, originY: y },
  };
}

/**
 * **Whose a desk press on the spine is** (`desk-grab.ts` `markSeat`): the lit
 * joint's, by `keelSeat`, and while the spine flips, the end under the thumb —
 * the nearer where both are. Both seats' presses answer a lit joint, so the
 * test screen's mouse was the pilot's on every joint, refused on the
 * navigator's half.
 */
export function keelGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "keel");
  if (s === null) return undefined;
  const { cfg, beat, beatPhase, slow } = field;
  if (keelFlipping(s)) {
    const segs = keelSegs(l, cfg, s, beat, beatPhase, slow);
    let best: { seat: 1 | 2; d: number } | undefined;
    for (const seat of [1, 2] as const) {
      const end = keelEndCircle(segs, l, s, seat);
      if (end === null || !hitCircle(end, x, y)) continue;
      const d = Math.hypot(x - end.x, y - end.y);
      if (best === undefined || d < best.d) best = { seat, d };
    }
    return best?.seat;
  }
  const ring = keelJointCircle(l, cfg, s, beat, beatPhase, slow);
  if (ring === null || !hitCircle(ring, x, y)) return undefined;
  return keelSeat(s, cfg.cols) ?? undefined;
}

/** Whether a thumb at (x, y) from `seat` lands on a ring the spine has out this frame. */
function keelTakes(
  l: Layout,
  field: Field,
  s: KeelState,
  seat: 1 | 2,
  x: number,
  y: number,
): boolean {
  const { cfg, beat, beatPhase, slow } = field;
  const segs = () => keelSegs(l, cfg, s, beat, beatPhase, slow);
  if (keelFlipping(s)) {
    const end = keelEndCircle(segs(), l, s, seat);
    return end !== null && hitCircle(end, x, y);
  }
  if (keelBreathing(s) || keelCooling(s)) {
    return segs().some((g) => hitCircle(keelRingCircle(l, g.centre), x, y));
  }
  const ring = keelJointCircle(l, cfg, s, beat, beatPhase, slow);
  return ring !== null && hitCircle(ring, x, y);
}
