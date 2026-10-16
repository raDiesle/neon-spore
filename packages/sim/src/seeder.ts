import { hullRow } from "./config.js";
import { podDueTicks } from "./pods.js";
import type { Creature } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * THE SEEDER: the kill is a debt.
 *
 * The owner's SUCK page of 16 October 2026 (`docs/spec/suck-ideas.md`), built
 * at his word "build all". A body in one colour that a matching shot kills
 * like any slick — and where it died, a real pod is left hanging, with the
 * pod's own clock round it. Killing it is easy. What it leaves is not: three
 * shot in a hurry are three clocks running at once, and every one of them has
 * to be freed and swallowed or the wave is lost.
 *
 * **The pod is an ordinary pod, from the moment it hangs.** Same clock
 * (`podDueBeats`), same shot to free it, same maw to take it, same lost wave
 * if nobody does — so nothing here writes a pod rule, and the wave cannot
 * clear while it hangs (`beat.ts`). The creature has no state of its own and
 * needs none in the fingerprint: the pod it leaves is hashed as a pod.
 *
 * Only a shot seeds. A seeder that breaks the hull leaves nothing; the hull
 * has paid for it already.
 */

/**
 * A seeder killed by a shot: hang its pod where it died. Called from the kill
 * branch of `resolveBulletHit`, after the `destroy`, so the kill and the debt
 * are two events on one tick and in that order.
 */
export function seederSeeds(world: World, c: Creature): void {
  // Never on the hull row, which a pod may not hang on (`PodEntry.row`): one
  // killed in its grace beat leaves its pod a row up, still in reach of the
  // trigger that frees it.
  const row = Math.max(0, Math.min(c.row, hullRow(world.cfg) - 1));
  world.pods.push({
    id: world.nextId++,
    colMilli: c.col * MILLI,
    rowMilli: row * MILLI,
    driftMilli: 0,
    loose: false,
    kind: "pod",
    dueTicks: podDueTicks(world, {}),
    crossMilli: 0,
  });
  world.events.push({ type: "seederSeeds", col: c.col, row });
}
