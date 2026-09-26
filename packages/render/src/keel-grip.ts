import { type KeelState, keelLit, NO_JOINT, type SimConfig } from "@neon-spore/sim";
import { keelRingCircle } from "./keel-marks.js";
import { keelSegs } from "./keel-pose.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
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
 * **Only a lit joint has a ring.** Between joints, in the socket, the tempo
 * run's rests and everything after, a tap there is the cannon's.
 */

/** The ring round the lit joint, where it stands this frame, or `null` when no joint is lit. */
export function keelJointCircle(
  l: Layout,
  cfg: SimConfig,
  s: KeelState,
  beat: number,
  beatPhase: number,
): Circle | null {
  if (!keelLit(s) || s.joint === NO_JOINT) return null;
  const seg = keelSegs(l, cfg, s, beat, beatPhase)[s.joint];
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
  const ring = keelJointCircle(l, field.cfg, s, field.beat, field.beatPhase);
  if (ring === null || !hitCircle(ring, x, y)) return null;
  const seat = field.seat;
  return {
    player: seat,
    command: { kind: "drag", target: "keelJoint", on: true, fromMilli: 0 },
    hold: { kind: "drag", target: "keelJoint", player: seat, originX: x, originY: y },
  };
}
