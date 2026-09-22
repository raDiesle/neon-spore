import { NO_BRAKE, spoolBoss, spoolCol, spoolHeld } from "./spool.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The brake on THE SPOOL**, off the wire, on the tick.
 *
 * The shortest hand of any boss in the game, and that is the boss: there is
 * one control, one seat has it, and nothing about holding it is ever judged
 * here. A brake is a **level** and not an edge — what it is worth is the rate
 * it pays the line out at, which is only ever known a beat at a time
 * (`spool-step.ts`, `spoolPayRateMilli`). So this page carries the depth and
 * says nothing about it.
 *
 * **`spoolBrake` is the pilot's and nobody else's**, `sinewLeft`'s rule: the
 * seat is checked against the target's name here rather than carried beside
 * it, because there is one brake on one spool and the navigator's half of the
 * fight is a zone she reads and a word she says.
 *
 * **Letting go is not neutral.** A brake with no hand on it reads as fully
 * shallow and the line runs at its fastest (`spoolDepthMilli`), which is what
 * makes the one gesture in this fight a hold rather than a press — and why a
 * hand coming off says so out loud.
 */
export function spoolHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "spoolBrake") return;
  if (player !== 1) return;
  const s = spoolBoss(world);
  if (s === null) return;
  if (!command.on) {
    if (!spoolHeld(s)) return;
    s.brakeMilli = NO_BRAKE;
    world.events.push({ type: "spoolLet", col: spoolCol(world.cfg) });
    return;
  }
  const reach = world.cfg.spoolReachMilli;
  const was = s.brakeMilli;
  s.brakeMilli = Math.max(0, Math.min(reach, Math.round(command.fromYMilli ?? 0)));
  if (was === NO_BRAKE) world.events.push({ type: "spoolGrip", col: spoolCol(world.cfg) });
}
