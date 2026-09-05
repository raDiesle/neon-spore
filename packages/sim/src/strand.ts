import { livingKindForColor } from "./kinds.js";
import { nextInt } from "./rng.js";
import type { Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE STRAND: two to five bodies threaded on one line, and the first arrival
 * **neither seat can answer with what is on their own screen**.
 *
 * One body of kind `"strand"` is one bead of it; the creature is the group of
 * them sharing a `strandId`, the way one `echo` body is one instance of a
 * phenomenon rather than the whole of it. There is deliberately no hub —
 * nothing like THE GYRE's — because there would be nothing for one to do: a
 * wheel carries its mounts around a rim no mount could compute, and a thread
 * carries nothing at all. Every bead falls a row a beat exactly like a slick,
 * and what binds them is an identity and a place, which are two integers on
 * the bodies themselves.
 *
 * ## The split, and it runs both ways
 *
 * The beads alternate red and cyan along the thread, and only one of them may
 * be shot at a time — the lit one, which is always at one end of what is still
 * alive.
 *
 * - **Player 2 is shown which bead is lit** and no colour at all: on the
 *   navigator's screen a thread is a row of sealed beads (`render/strand.ts`).
 * - **Player 1 is shown the colours** and no mark: on the pilot's screen the
 *   beads are the slicks and bulbs the pair already has words for, and nothing
 *   says which one is next.
 *
 * So the pilot cannot put the cannon under the right bead without being told
 * which it is, and the navigator — who holds both triggers — cannot load the
 * right colour without being told what it is. Every other split in this game
 * names one seat that has to speak; this one names both, which is why it is
 * the first `"both"` in `TALKER` (`render/comms.ts`).
 *
 * ## The end is rolled again after every change, and that is the creature
 *
 * A thread is eaten from its ends inward, and **which end is lit is rolled
 * afresh every time the run of live beads changes** (`lightStrandEnd`). It was
 * a fixed march from one rolled end for a day, and a fixed march gives the
 * creature away on the second bead: the first raisin shows the pilot which end
 * the order started at, so from then on they know which bead is next without
 * being told — and the navigator, who has heard one colour and knows the beads
 * alternate, can work out all the rest the same way. One exchange, and the
 * thread answers itself.
 *
 * Rolled, neither seat can derive the other's half at any point. The pilot
 * sees two live ends in two different colours and cannot know which is lit;
 * the navigator sees which is lit and has never seen a colour. Both calls stay
 * worth making until the last bead, which is what this creature is for.
 *
 * The **shape** of a thread — how many beads, how far apart, which row each
 * hangs in and which beats it falls on — is `strand-shape.ts` next door, cut
 * out when the wave took this file over its limit. That file needs no world;
 * everything here reads one.
 *
 * The live beads are always a **contiguous run**, and every rule here leans on
 * it: a kill only ever takes an end, and a wrong shot only ever gives back the
 * raisin next to one (`strand-round.ts`). So "the two ends" is the first and
 * last of `strandLive`, and there is never a hole in the middle to reason
 * about.
 *
 * ## A wrong bead costs the thread going backwards
 *
 * A shot that lands on a live bead which is not the lit one does not miss
 * quietly: it swells the nearest raisin back into a bead, so the thread the
 * pair had shortened is longer than it was. That is the whole reason a
 * shrivelled bead stays hanging — a mistake needs something to undo, and a
 * raisin on the string is the only readout either seat has of how far along
 * they are.
 */

/** Which thread this bead hangs on, or `-1` for a body that is not one. */
export function beadStrand(c: Creature): number {
  return c.strandId ?? -1;
}

/** Where it hangs along the thread, counting from the leftmost. Zero for a
 * body that is not a bead, which nothing asks — `beadStrand` is that test. */
export function beadOrder(c: Creature): number {
  return c.strandOrder ?? 0;
}

/** Whether this bead has already been shrivelled. Absent and `false` are one
 * state: a bead arrives alive (`StrandState.strandSpent`). */
export function beadIsSpent(c: Creature): boolean {
  return c.strandSpent === true;
}

/** Whether this is the bead a shot may land on, as the flag alone. Ask
 * `beadIsActive` instead unless you are `lightStrandEnd`: a lit flag left on a
 * body that has since been shrivelled is the state this file exists to
 * prevent, and that function is the one that clears it. */
export function beadIsLit(c: Creature): boolean {
  return c.strandLit === true;
}

/**
 * The body a bead is drawn as — the slick or the bulb its colour names.
 * Reached through `wornKind` and never called at a draw site directly, for the
 * reason every other worn body has one: what a thing *is* and what it *looks
 * like* are two questions. A slick for a bead built without a colour, the
 * fallback `rindBecomes` and `echoBecomes` already make; nothing builds one.
 */
export function strandBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/** Every bead on this thread, spent or not. Exported so render's thread pass
 * and the sweep in `strand-round.ts` ask the same question once. */
export function strandBeads(world: World, strandId: number): Creature[] {
  return world.creatures.filter((c) => beadStrand(c) === strandId);
}

/**
 * The beads of this thread still alive, leftmost first — which is also the run
 * whose two ends are the only places a shot may land.
 *
 * Sorted on the place along the thread rather than on the column, and the two
 * are the same thing today because nothing moves a bead sideways. The sort is
 * on the field the rule owns, so a thread that ever does move keeps its ends
 * where the pair counted them.
 */
export function strandLive(world: World, strandId: number): Creature[] {
  return world.creatures
    .filter((c) => beadStrand(c) === strandId && !beadIsSpent(c))
    .sort((a, b) => beadOrder(a) - beadOrder(b));
}

/**
 * The bead that has to be shot next: the lit one.
 *
 * The fallback to the leftmost is a floor and not a case the game reaches —
 * every path that changes the run calls `lightStrandEnd` — but a thread with
 * nothing lit would be a thread no shot could ever answer, which is a worse
 * failure than one lit at the wrong end.
 */
export function strandHead(world: World, strandId: number): Creature | null {
  const live = strandLive(world, strandId);
  return live.find(beadIsLit) ?? live[0] ?? null;
}

/** Whether this bead is the one a shot may land on. The one rule render's mark
 * and `beadStruck` both call. */
export function beadIsActive(world: World, c: Creature): boolean {
  if (c.kind !== "strand" || beadIsSpent(c)) return false;
  return strandHead(world, beadStrand(c))?.id === c.id;
}

/** How many beads of this thread are still alive. */
export function strandLeft(world: World, strandId: number): number {
  return strandLive(world, strandId).length;
}

/**
 * Light one end of what is left of a thread, rolled — and put out whatever was
 * lit before.
 *
 * **Called after every change to the run and nowhere else**: the shot that
 * shrivels a bead, and the shot that swells one back. That is what stops
 * either seat deriving the other's half — the argument is at the top of this
 * file — and it is why the flag is stored rather than read off an order.
 *
 * One draw whichever end comes up, so the stream is spent identically on both
 * devices and `rng.state` in `hash.ts` is what makes them agree; and no draw at
 * all when one bead is left, because there is nothing left to choose between.
 */
export function lightStrandEnd(world: World, strandId: number): void {
  const live = strandLive(world, strandId);
  for (const c of live) c.strandLit = false;
  if (live.length === 0) return;
  const end = live.length === 1 || nextInt(world.rng, 2) === 0 ? live[0]! : live[live.length - 1]!;
  end.strandLit = true;
}
