import {
  type SimConfig,
  type SpoolState,
  spoolDepthMilli,
  spoolHeld,
  spoolPaying,
} from "@neon-spore/sim";
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
 * (`sim/spool-hand.ts`) and his screen is the only one the rail is drawn on
 * (`showsSpoolBrake`). While it asks for his hand, the navigator is shown
 * the partner's turning ring and clock where the knob rests, as every mark
 * is shown to the seat it is not asking (`spool-brake.ts`) — and a thumb of
 * hers there is handed through for the simulation to refuse, in red on the
 * knob. It is a press and nothing more: it holds nothing, so no move of hers
 * is refused a second time. Anywhere else, or once his hand is on the brake,
 * a thumb of hers where the rail would be finds whatever is behind it.
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

/**
 * Whether the brake is **asking** for a hand: the line running and nobody on
 * it — the moment the HOLD cue stands on the knob (`boss-cue-read-za.ts`), and
 * the one the halo and the partner's ring are drawn in.
 */
export function spoolBrakeAsks(s: SpoolState): boolean {
  return spoolPaying(s) && !spoolHeld(s);
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
  if (s === null || !spoolTakesHand(s)) return null;
  const rest = spoolKnobCircle(l, field.cfg, s, field.beat, field.beatPhase);
  if (!hitCircle(rest, x, y)) return null;
  const press = {
    kind: "drag",
    target: "spoolBrake",
    on: true,
    fromMilli: 0,
    fromYMilli: 0,
  } as const;
  if (field.seat === 2) {
    // Hers to be refused on only where a mark of the brake is drawn for her.
    const shown = showsSpoolBrake(l.role) || spoolBrakeAsks(s);
    return shown ? { player: 2, command: press, hold: null } : null;
  }
  if (!showsSpoolBrake(l.role)) return null;
  return {
    player: 1,
    command: press,
    hold: { kind: "drag", target: "spoolBrake", player: 1, originX: x, originY: y },
  };
}

/**
 * **Whose thumb the knob under this point is for** — always the pilot's, and
 * the desk's question before a press, because the knob is there for the
 * navigator too and only refuses her (`desk-grab.ts`, as `wardenGripSeat`).
 */
export function spoolGripSeat(l: Layout, x: number, y: number, field: Field): 1 | undefined {
  const s = bossOf(field, "spool");
  if (s === null || !spoolTakesHand(s)) return undefined;
  const rest = spoolKnobCircle(l, field.cfg, s, field.beat, field.beatPhase);
  return hitCircle(rest, x, y) ? 1 : undefined;
}
