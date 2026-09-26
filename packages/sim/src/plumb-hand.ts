import { midCol } from "./config.js";
import { levelling, PLUMB_UNREAD, plumbBoss, plumbTrue } from "./plumb.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/** The furthest a phone leans either way, in thousandths of a degree: gamma's own range. */
const MAX_LEAN_MILLI = 90_000;

/**
 * Two leans on THE PLUMB, one weight each.
 *
 * **Geometry says whose weight is whose**, THE MANTLE's rule
 * (`mantle-hand.ts`): `plumbLevelLeft` answers only Player 1 and
 * `plumbLevelRight` only Player 2, and the wrong seat's reading does nothing,
 * silently.
 *
 * **One drag is one reading**: `fromMilli` is the phone's lean, thousandths
 * of a degree off level, and `on` says whether the phone is being read at all
 * — `LevelTilt`, §31's primitive. A lift (`on: false`) is a phone that has
 * stopped reporting, which is as far off level as a lean can be
 * (`PLUMB_UNREAD`). Recorded whenever the bob is present, so a phone already
 * level when a step lights is counted from its first beat.
 *
 * What a lean is worth is counted on the beat (`plumb-step.ts`); what is
 * heard here is the one instant the beat cannot see — **a lean drifting out
 * of range** while the lit level step was counting, which starts its count
 * again from nought.
 */
export function plumbHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "plumbLevelLeft" && command.target !== "plumbLevelRight") return;
  const s = plumbBoss(world);
  if (s === null) return;
  const side: 0 | 1 = command.target === "plumbLevelLeft" ? 0 : 1;
  const wants: 1 | 2 = side === 0 ? 1 : 2;
  if (player !== wants) return;
  const lean = command.fromMilli;
  if (!Number.isInteger(lean)) return;
  const was = plumbTrue(s);
  s.tiltMilli[side] = command.on
    ? Math.max(-MAX_LEAN_MILLI, Math.min(MAX_LEAN_MILLI, lean))
    : PLUMB_UNREAD;
  if (!was || plumbTrue(s) || !levelling(s)) return;
  s.heldBeats = 0;
  world.events.push({ type: "plumbDrift", side, col: midCol(world.cfg) });
}
