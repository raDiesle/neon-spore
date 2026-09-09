import { ticksPerBeat } from "./config.js";
import { wornKind } from "./creature-rules.js";
import { type Color, isMeteorKind } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * What a pod *gives*, once the mouth has closed on it.
 *
 * Its own file for the reason `fleet-board.ts` is not `fleet.ts`: everything
 * left next door is where a pod is and how it gets there — hanging, crossing,
 * falling, homing, arriving — and these three are the only things in the whole
 * subject that touch the *ship*. `pods.ts` had reached the ceiling `CLAUDE.md`
 * sets when a pod learned to cross the field, and this is the seam it already
 * had in it.
 *
 * `PodKind` is the closed list of them and `resolveIntake` is the one switch;
 * nothing else in the game calls these directly.
 */

/** The hull repair a plain pod has always given. Clamped, never a debt. */
export function mend(world: World): void {
  world.hullMilli = Math.min(100 * MILLI, world.hullMilli + world.cfg.podRepair * MILLI);
}

/**
 * Every creature on the field is gone. A rock is not shot down, it is swept
 * aside — a meteor cannot carry a `destroy` event, since that event names a
 * colour and a meteor has none — so it leaves a `hole` instead and pays
 * nothing. The field must be empty afterwards or the word "purge" is a lie.
 */
export function purge(world: World): void {
  for (const c of world.creatures) {
    if (isMeteorKind(c.kind)) {
      world.events.push({ type: "hole", col: c.col, row: c.row });
      continue;
    }
    world.events.push({
      type: "destroy",
      col: c.col,
      row: c.row,
      color: c.color as Color,
      kind: wornKind(c),
    });
    world.score += world.cfg.scoreDestroy;
  }
  world.creatures = [];
}

/** Hold the shield armed without a trigger for `wardBeats` beats. */
export function ward(world: World): void {
  world.wardUntilTick = world.tick + world.cfg.wardBeats * ticksPerBeat(world.cfg);
}
