import { curtainHemStruck } from "./curtain-shot.js";
import { spanOf } from "./span.js";
import type { Bullet, Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **A body the cannon cannot answer still stops the bolt**, and what each of
 * them does with it.
 *
 * The owner's rule of 14 September 2026: *shots with the cannon, generally
 * speaking, should never go through enemies, but should hit with no effect if
 * the body cannot be destroyed with the cannon's colour. Reflect, like the
 * magnet, or mark it, like the meteor, or something else — whatever is
 * suitable.* Five kinds used to be skipped by `shot-reach.ts` altogether, each
 * with a paragraph saying a bolt went past it to whatever was above; every one
 * of those paragraphs is overruled.
 *
 * Its own file rather than five more branches in `resolve`, which was at its
 * 250-line ceiling: next door is *what a shot does to a body it can answer*,
 * and this is the one answer that is the same shape for several bodies at once.
 */

/**
 * The kinds that turn a bolt away rather than taking a crater from it.
 *
 * A set rather than four branches, because what they have in common is the
 * whole reason they are together: not one of them is stone, and a bolt that
 * chipped a gum or a leech would be telling the pair that shooting it more
 * would work. Every one is answered by a hand or by a control being moved.
 */
const BOUNCES_A_BOLT: ReadonlySet<Creature["kind"]> = new Set([
  "gum",
  "limpet",
  "leech",
  "weight",
  // And a mine, which is the sharpest case the owner's rule has: it is
  // answered by a finger on its tile and by nothing else, and on a wave that
  // draws it to the pilot a bolt that killed one would hand the seat holding
  // the cannon both halves of the sentence at once (`mine.ts`).
  "mine",
]);

/** Whether a bolt that meets this kind is spent on it with no effect. */
export function refusesABolt(kind: Creature["kind"]): boolean {
  return kind === "cairn" || kind === "curtain" || BOUNCES_A_BOLT.has(kind);
}

/**
 * The bolt, spent.
 *
 * THE CAIRN marks, because it is seven rocks and a rock takes a crater — the
 * branch `isWardable` already takes for every other rock in the game. The other
 * four bounce, because none of them is stone: a bolt turned away says *wrong
 * tool* where a crater would say *keep going*.
 *
 * Neither books a colour miss. `magnetStruck` argues that at length and the
 * argument is the same here: the ammunition was never the question, the body
 * was, and booking it would read one seat's misreading to the other's balance.
 */
export function refuseBolt(world: World, b: Bullet, hit: Creature): void {
  if (hit.kind === "cairn") {
    hit.holes = Math.min(world.cfg.maxHoles, hit.holes + 1);
    world.events.push({
      type: "hole",
      col: hit.col,
      row: hit.row,
      kind: hit.kind,
      span: spanOf(hit),
    });
    return;
  }
  // THE CURTAIN's fabric takes a soft lobe off the hem, or is cloth (`curtain-shot.ts`).
  if (hit.kind === "curtain") {
    curtainHemStruck(world, b, hit);
    return;
  }
  world.events.push({ type: "bounce", col: hit.col, row: hit.row, color: b.color });
}
