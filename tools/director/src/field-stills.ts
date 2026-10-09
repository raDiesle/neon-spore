import { autopilotHand } from "@neon-spore/hands";
import { type Command, step, type TimedCommand, ticksPerBeat, type World } from "@neon-spore/sim";
import type { FieldControlDef } from "./field-control-def.js";

/**
 * **The moments a card's strip of stills shows**, found by playing its pose
 * forward with AUTO's hand (`@neon-spore/hands`, the same hand the stage's
 * AUTO plays with) and watching for the commands that reach the card's rows.
 *
 * The owner, 9 October 2026: to choose one look per control he has to see
 * every use of it *before, during and after* the gesture, side by side,
 * without playing each one. ▶ TRY IT (`field-try.ts`) plays one; this finds
 * the same six moments in every use AUTO can play: a beat before the
 * press, the press, halfway, the lift, and one and three beats after it.
 *
 * Pure: the run is the simulation's and the hand's, so the moments are
 * tested under `bun test`; `field-stills-art.ts` draws them.
 */

/** How long AUTO is given to reach a card's control, in beats. */
export const REACH_BEATS = 24;

export interface Still {
  /** BEFORE, PRESS, MOVING, LIFT — STILL HELD where AUTO kept its thumb
   * down past the reach — +1 BEAT, +3 BEATS. */
  label: string;
  /** Ticks after the pose's own tick. */
  at: number;
}

/** Whether a command is one of these rows speaking: a drag on a row's
 * target, or a command a row with no target says it sends. */
export function reaches(c: Command, rows: readonly FieldControlDef[]): boolean {
  if (c.kind === "drag") return rows.some((r) => r.dragTarget === c.target);
  return rows.some((r) => !r.dragTarget && r.sends.includes(c.kind));
}

/** Whether a command ends what the rows' press began: a drag let go. */
const lifts = (c: Command, rows: readonly FieldControlDef[]): boolean =>
  c.kind === "drag" && !c.on && reaches(c, rows);

/** One tick of AUTO on `w`: what it sent, already stepped. */
export function autoTick(w: World): TimedCommand[] {
  const hand = autopilotHand(w);
  const sent = hand ? hand(w).map((c) => ({ ...c, tick: w.tick })) : [];
  step(w, sent);
  return sent;
}

/**
 * The six moments for `rows` on `world`, which is played forward and spent.
 * Null when AUTO has no hand here or never reaches the rows in time. A
 * press with no lift — a tap — takes its lift half a beat on.
 */
export function stillTicks(world: World, rows: readonly FieldControlDef[]): Still[] | null {
  if (!autopilotHand(world)) return null;
  const tpb = ticksPerBeat(world.cfg);
  const start = world.tick;
  let press: number | null = null;
  let lift: number | null = null;
  for (let i = 0; i < REACH_BEATS * tpb && !world.over && lift === null; i++) {
    const at = world.tick - start;
    const sent = autoTick(world).map((s) => s.command);
    if (press === null && sent.some((c) => reaches(c, rows))) press = at;
    else if (press !== null && sent.some((c) => lifts(c, rows))) lift = at;
  }
  if (press === null) return null;
  // A tap sends no lift, and a lever AUTO is still holding sends none yet.
  const held = lift === null && rows.some((r) => r.sends.includes("drag"));
  const up = lift ?? press + (held ? 2 * tpb : Math.round(tpb / 2));
  const ticks = [
    Math.max(0, press - tpb),
    press,
    Math.round((press + up) / 2),
    up,
    up + tpb,
    up + 3 * tpb,
  ];
  const labels = ["BEFORE", "PRESS", "MOVING", held ? "STILL HELD" : "LIFT", "+1 BEAT", "+3 BEATS"];
  return labels.map((label, i) => ({ label, at: ticks[i] ?? 0 }));
}
