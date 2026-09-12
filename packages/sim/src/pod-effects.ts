import { ticksPerBeat } from "./config.js";
import { wornKind } from "./creature-rules.js";
import { type Color, isMeteorKind } from "./types.js";
import type { World } from "./world.js";

/**
 * What a pod *gives*, once the mouth has closed on it.
 *
 * Its own file for the reason `fleet-board.ts` is not `fleet.ts`: everything
 * left next door is where a pod is and how it gets there — hanging, crossing,
 * falling, homing, arriving — and these two are the only things in the whole
 * subject that touch the *ship*. `pods.ts` had reached the ceiling `CLAUDE.md`
 * sets when a pod learned to cross the field, and this is the seam it already
 * had in it.
 *
 * `PodKind` is the closed list of them and `resolveIntake` is the one switch;
 * nothing else in the game calls these directly. There were three: the plain
 * pod's hull repair went with the hull's points (`pod-types.ts`).
 */

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
  }
  world.creatures = [];
}

/** Hold the shield armed without a trigger for `wardBeats` beats. */
export function ward(world: World): void {
  world.wardUntilTick = world.tick + world.cfg.wardBeats * ticksPerBeat(world.cfg);
}
