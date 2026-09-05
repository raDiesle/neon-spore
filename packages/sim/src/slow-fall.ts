import { echoFalls } from "./echo.js";
import { stepStrand } from "./strand-round.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * The bodies that come down **slower than a tile a beat**, and what each does
 * with the beats it does not spend falling.
 *
 * Its own file rather than two more branches in `beat.ts`, which was at its
 * 250-line limit the day THE STRAND's wave was written. The seam is real
 * rather than a place to cut: every other branch in that loop replaces the fall
 * with a *different* movement — a diagonal, a hop, a climb — and these two
 * replace it with **less of the same one**. THE ECHO takes half the beats and
 * nothing on the rest; THE STRAND takes half the beats and spends the others
 * undulating, which is one movement drawn as two.
 *
 * One call rather than two, because `beat.ts` asks one question of a body —
 * *have you already moved this beat* — and a second `if` in that loop is a
 * second place the answer can be forgotten.
 */

/**
 * Move a slow body, and say whether it has been dealt with.
 *
 * `true` means the caller must not apply the ordinary fall: either the body
 * moved here, or this is one of the beats it simply does not take.
 */
export function slowStep(world: World, c: Creature): boolean {
  // Half as fast and nothing else: on the beats it does not take there is no
  // fraction of a tile for it to move, because the simulation stores integers.
  if (c.kind === "echo") return !echoFalls(world.cfg, world.beat);
  // Half as fast *and* a wave: every bead trades places with the rank it is not
  // in, every beat, and steps down on the beats the thread takes one.
  if (c.kind === "strand") {
    stepStrand(world, c);
    return true;
  }
  return false;
}
