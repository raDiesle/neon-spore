import { beadStrand, type Creature, type World } from "@neon-spore/sim";

/**
 * Which beads of THE STRAND are on one thread, and in what order along it.
 *
 * Its own file because three passes ask the question — the line drawn through
 * them (`strand.ts`), the mark on the one that may be shot (`strand-mark.ts`)
 * and the plating on the ones that may not (`strand-armour.ts`) — and two of
 * those now run either side of the body pass. A copy of this in each would be
 * three answers to "which beads are these", which is exactly the shape of
 * mistake that puts a mark on one bead and a cage on another.
 */

/** Every bead on the field, in no particular order. */
function beads(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "strand");
}

/**
 * The threads on the field, each as its own beads sorted along the line — by
 * column, which is the order an eye reads them in and the order the pair
 * counts in. `beadOrder` would give the same answer today and is the rule's
 * own field rather than the picture's; a line is drawn between the things on
 * the screen, so it is sorted by where they are.
 */
export function strandThreads(world: World): Creature[][] {
  const byId = new Map<number, Creature[]>();
  for (const c of beads(world)) {
    const id = beadStrand(c);
    const on = byId.get(id);
    if (on) on.push(c);
    else byId.set(id, [c]);
  }
  return [...byId.values()].map((on) => on.sort((a, b) => a.col - b.col));
}
