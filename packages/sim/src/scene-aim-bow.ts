import { latchBowFromMilli } from "./latch-bow.js";
import { sinewBowFromMilli } from "./sinew-bow.js";
import type { Command } from "./types.js";
import { wardenRopeFromMilli } from "./warden-bow.js";
import type { World } from "./world.js";

/**
 * **The bowed pulls a film writes straight** (`pull-path.ts`), cut off
 * `scene-aim.ts` when the third arrived — THE WARDEN's rope, THE SINEW's
 * handles and THE LATCH's grips: an author writes how far a hand
 * pulls, and the world lays that on the bow, because a film's thumb straight
 * down a bowed channel would stray. THE LID's cord is aimed in `aimed()`
 * itself, since it is found by its column first.
 *
 * `null` for a command that is none of these, so `aimed()` goes on.
 */
export function aimedOnBow(world: World, command: Command): Command | null {
  if (command.kind !== "drag") return null;
  if (command.target === "wardenTether") {
    // THE WARDEN's rope bows toward the middle from wherever the pupil hung
    // it: the film writes the carry in taut's units (`warden-bow.ts`).
    const b = world.boss;
    if (b?.kind !== "warden") return command;
    return { ...command, ...wardenRopeFromMilli(world.cfg, b, command.fromYMilli ?? 0) };
  }
  if (command.target === "sinewLeft" || command.target === "sinewRight") {
    // THE SINEW's handles bow away from the mass: the film writes how far
    // down (`sinew-bow.ts`). A carry across is a catch or a sway, and is
    // left as written.
    if (world.boss?.kind !== "sinew" || command.fromMilli !== 0) return command;
    const player = command.target === "sinewLeft" ? 1 : 2;
    return { ...command, ...sinewBowFromMilli(world.cfg, player, command.fromYMilli ?? 0) };
  }
  if (command.target === "latchGripLeft" || command.target === "latchGripRight") {
    // THE LATCH's grips bow away from the tendril, the same way (`latch-bow.ts`).
    if (world.boss?.kind !== "latch" || command.fromMilli !== 0) return command;
    const grip = command.target === "latchGripLeft" ? 0 : 1;
    return { ...command, ...latchBowFromMilli(world.cfg, grip, command.fromYMilli ?? 0) };
  }
  return null;
}
