import { growCrawler } from "./crawler-round.js";
import type { Creature } from "./creature-types.js";
import type { SpawnEntry } from "./entries.js";
import { mountsFor } from "./gyre.js";
import { stringStrand } from "./strand-spawn.js";
import type { World } from "./world.js";

/**
 * **The arrivals that are more than one body.** Three kinds bring company
 * with them, and this is the one place a queue entry becomes more than the
 * creature it named. Everything else in the game spawns exactly one.
 *
 * Split out of `spawn.ts` with `spawn-fields.ts`, for the same reason: the
 * file was on its limit and the next creature could not enter. Called after
 * the entry's own body has been pushed, so each block can read it back off
 * the end of `world.creatures` and build the rest from it — the rim in its
 * positions, the thread hung to the right, the worm fed on a link at a time.
 */
export function companionsOnSpawn(world: World, entry: SpawnEntry): Creature[] {
  // A gyre is the one arrival that brings bodies with it: six on its rim,
  // alternating, built from the hub that was just pushed so that they are
  // already in their rim positions on the frame it enters. Nothing else in
  // the game spawns more than the entry named, which is why this is the one
  // place a queue entry becomes more than one creature.
  if (entry.kind === "gyre") {
    const hub = world.creatures[world.creatures.length - 1]!;
    return mountsFor(world, hub);
  }
  // And a strand is the second, on the same terms with one difference: the
  // entry itself *is* one of the bodies. It becomes the leftmost bead of the
  // thread and `stringStrand` hangs the rest to its right — settling that
  // first bead's own colour and place in the order on the way, because both
  // follow from a roll that cannot be taken until the count is known.
  if (entry.kind === "strand") {
    const first = world.creatures[world.creatures.length - 1]!;
    return stringStrand(world, first, entry.beads);
  }
  // And a crawler is the third, on the strand's terms: the entry itself is
  // the **head** and `growCrawler` hangs the segments and the tail out
  // behind it, settling the head's own wall, row and heading on the way.
  // Every link but the head starts off the field, so the worm feeds itself
  // onto the ship a link at a time whatever length the wave asked for.
  if (entry.kind === "crawler") {
    const head = world.creatures[world.creatures.length - 1]!;
    return growCrawler(world, head, entry.segments, entry.side);
  }
  return [];
}
