import { type SimConfig, type SpoolState, spoolDepthMilli } from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { spoolPlaced } from "./spool-pose.js";
import { spoolBrakeAt } from "./spool-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { showsSpoolBrake } from "./view-role-clocks-c.js";

/**
 * **The thumb on THE SPOOL's brake** — half two of the look lane, and the
 * half that makes the one control in the fight answer a hand at all.
 *
 * Its own page beside `spool-brake.ts`, because only the answer is new: the
 * knob a finger is answered at and the knob the drawing paints are the same
 * `spoolBrakeAt` off the same `spoolPlaced`, and all this file adds is
 * *whether* the press counts.
 *
 * **One seat, one handle.** The brake is the pilot's by the target's name
 * (`sim/spool-hand.ts`) and his screen is the only one it is drawn on
 * (`showsSpoolBrake`), so a thumb on the navigator's screen where the rail
 * would be finds whatever is behind it.
 *
 * **What it refuses is what the drawing refuses**: the slack spool, which has
 * no rail drawn on it and drifts off the top with nothing left to brake. The
 * simulation would still write a depth down in those beats, and nothing
 * would read it — a press there falls through as if no rail were drawn.
 *
 * **The rest, and not where the knob has been carried.** `handles.ts`'
 * standing rule: a hand that has carried the knob is captured, so nothing is
 * hit-tested again until it lets go — and letting go puts the knob back at
 * the top (`NO_BRAKE`), which is exactly where the next press is answered.
 */

/** Whether the brake is there to take hold of: every phase but the slack. */
export function spoolTakesHand(s: SpoolState): boolean {
  return s.phase !== "slack";
}

/** The knob where it rests with no hand on it, on this frame's spool. */
export function spoolKnobCircle(
  l: Layout,
  cfg: SimConfig,
  s: SpoolState,
  beat: number,
  beatPhase: number,
): Circle {
  const b = spoolBrakeAt(l, cfg, spoolPlaced(l, cfg, s, beat, beatPhase), 0);
  return { x: b.knob.x, y: b.knob.y, r: handleRadius(l, cfg) };
}

/** Where the knob is **standing**, with the pilot's thumb wherever it has carried it. */
export function spoolKnobStanding(
  l: Layout,
  cfg: SimConfig,
  s: SpoolState,
  beat: number,
  beatPhase: number,
): Circle {
  const pose = spoolPlaced(l, cfg, s, beat, beatPhase);
  const b = spoolBrakeAt(l, cfg, pose, spoolDepthMilli(s));
  return { x: b.knob.x, y: b.knob.y, r: handleRadius(l, cfg) };
}

/**
 * The press. `bossOf(field, "spool")` is `null` on every wave without the
 * spool. The grab reports no depth — it takes hold at the shallow end, which
 * is where the knob is drawn — and every move after it is how far down the
 * rail the thumb has carried it, in thousandths of a tile.
 */
export function spoolBrakeUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "spool");
  if (s === null || field.seat !== 1 || !showsSpoolBrake(l.role) || !spoolTakesHand(s)) {
    return null;
  }
  const rest = spoolKnobCircle(l, field.cfg, s, field.beat, field.beatPhase);
  if (!hitCircle(rest, x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "spoolBrake", on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: "spoolBrake", player: 1, originX: x, originY: y },
  };
}
