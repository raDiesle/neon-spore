import type { World } from "./world.js";

/**
 * **A body leaving the field.** The counterpart to `spawn.ts`, and one place
 * rather than fourteen.
 *
 * `world.creatures = world.creatures.filter((c) => c.id !== id)` stood written
 * out eleven times and its set-shaped sibling three more — in every file that
 * kills something, which is every creature file there is. Each new one copied
 * whichever version its neighbour had, and `bullet-hit.ts` sat at exactly its
 * line limit with five of them in it.
 *
 * A filter and not a splice, and that is the part worth stating: the survivors
 * keep the order they were in. Two devices walk `world.creatures` in step and
 * a body that changed places is a body that fires, falls or is hit in a
 * different order on one of them — a desync that reads like a network bug. The
 * determinism tests hold this, not the comment.
 *
 * Neither function cares whether the id is on the field. Removing something
 * already gone is how most of these sites are written (a hit resolved twice in
 * one beat), and it costs one pass over a short array.
 */
export function removeCreature(world: World, id: number): void {
  world.creatures = world.creatures.filter((c) => c.id !== id);
}

/**
 * The same for several at once, in one pass. Callers hand in the ids they
 * gathered while walking the field — never a live reference to the array being
 * filtered.
 */
export function removeCreatures(world: World, ids: Iterable<number>): void {
  const gone = ids instanceof Set ? ids : new Set(ids);
  if (gone.size === 0) return;
  world.creatures = world.creatures.filter((c) => !gone.has(c.id));
}
