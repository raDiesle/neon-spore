import { lureIsSpent } from "./creature-rules.js";
import { removeCreatures } from "./field.js";
import type { World } from "./world.js";

/**
 * **THE LURE leaving on its own**, which is the one thing in this game a body
 * does at the end of a beat for no reason anybody pressed.
 *
 * Cut out of the top of `beat.ts` when THE CRAWLER needed room there, and the
 * seam is honest rather than convenient: everything left in that file is the
 * metronome and the loop that moves what is standing on the field, and this is
 * a rule about one creature that happened to be sitting above both. It is the
 * counterpart of `creature-rules.ts`' `lureIsSpent` — that file says *when*,
 * and this one is the half that mutates a world.
 */

/**
 * Every lure that has reached the row it goes on, taken off the field.
 *
 * Called from `onBeat` **before** the fall, so a lure spends the beat gliding
 * into `lureVanishRow` in plain sight of both players and goes on the beat it
 * would step off it. Deliberately not a beat of standing still: nothing else
 * in the field stops falling, so a pause would be the tell this creature
 * exists not to have.
 *
 * Collected and then removed rather than filtered in place, because the caller
 * is about to walk `world.creatures` itself.
 */
export function removeSpentLures(world: World): void {
  const spent = world.creatures.filter((c) => lureIsSpent(world.cfg, c));
  if (spent.length === 0) return;
  for (const c of spent) {
    world.events.push({
      type: "lureVanished",
      col: c.col,
      row: c.row,
      // Not null: `resolveLure` is the only branch a lure can take with a shot
      // in it, so a lure always carries the disguise's own colour, and that is
      // the colour the picture that fades has to be drawn in.
      color: c.color ?? "cyan",
    });
  }
  removeCreatures(
    world,
    spent.map((c) => c.id),
  );
}
