import type { SceneCommand } from "@neon-spore/sim";
import type { SceneAct } from "./scene-act-types.js";

/**
 * **A thumb rubbing a mark**: THE CHOIR's rub, scrubbed back and forth for as
 * long as the act holds it (`sim/choir-rub.ts`).
 *
 * Its own file for `scene-pump.ts`'s reason: a rub is the gesture whose whole
 * point is going *back*, and what a real thumb sends is a `RubCount` — how
 * many times it has turned since it went down (`render/rub-turns.ts`) — so a
 * film sends that, one more every `TURN_TICKS`, and the count at the lift.
 * Both seats rub the choir's mark, so a film writes one act a seat, `hand`.
 */

/** Ticks between two turns: an easy scrub, four a second at 120 ticks. */
const TURN_TICKS = 30;

export function rubCommands(act: SceneAct, player: 1 | 2): SceneCommand[] {
  const target = act.drag;
  if (target === undefined) return [];
  const until = act.until ?? act.tick;
  const out: SceneCommand[] = [];
  let turns = 0;
  for (let at = act.tick; at < until; at += TURN_TICKS) {
    out.push({ tick: at, player, command: rub(target, true, turns) });
    turns++;
  }
  out.push({ tick: until, player, command: rub(target, false, Math.max(0, turns - 1)) });
  return out;
}

function rub(target: NonNullable<SceneAct["drag"]>, on: boolean, id: number) {
  return { kind: "drag", target, on, fromMilli: 0, fromYMilli: 0, id } as const;
}
