import type { SimConfig } from "./config.js";
import { livingKindForColor, otherColor } from "./kinds.js";
import { nextInt } from "./rng.js";
import type { Color, Creature, CreatureKind } from "./types.js";
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
 * and what binds them is an identity and an order, which are two integers on
 * the bodies themselves.
 *
 * ## The split, and it runs both ways
 *
 * The beads alternate red and cyan along the shooting order, and only one of
 * them may be shot at a time — the head, then its neighbour, then the next.
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
 * **Which end the order starts at is rolled** on the beat the strand arrives,
 * and it is the one thing about this creature nobody may compose against
 * (`docs/spec/structure.md` 7.3 keeps randomness for exactly what one player
 * knows and the other does not). An authored end would be a pattern the pair
 * reads off the leftmost bead after three arrivals.
 *
 * ## A wrong bead costs the thread going backwards
 *
 * A shot that lands on a live bead which is not the head does not miss
 * quietly: it swells the last raisin back into a bead, so the thread the pair
 * had shortened is longer than it was. That is the whole reason a shrivelled
 * bead stays hanging — a mistake needs something to undo, and a raisin on the
 * string is the only readout either seat has of how far along they are.
 */

/**
 * Beads a thread may be authored with. Two is the shortest run that has an
 * order at all; five is most of a seven-column field, and a wider thread would
 * leave the pilot nowhere to stand that is not already under one.
 */
export const STRAND_MIN = 2;
export const STRAND_MAX = 5;

/**
 * How many beads this arrival actually gets: what the wave asked for, or
 * `strandBeads` when it asked for nothing, held inside the two bounds above
 * and inside the field's own width.
 *
 * Call this rather than reading `entry.beads` at a spawn site: the director
 * offers the range, the wave stores a number and the field decides what fits,
 * and a second spelling of the clamp is a thread hanging off the edge of a
 * screen it was never on.
 */
export function strandBeadCount(cfg: SimConfig, asked: number | undefined): number {
  const most = Math.max(1, Math.min(STRAND_MAX, cfg.cols));
  const wanted = Math.max(STRAND_MIN, Math.floor(asked ?? cfg.strandBeads));
  return Math.min(most, wanted);
}

/** Which thread this bead hangs on, or `-1` for a body that is not one. */
export function beadStrand(c: Creature): number {
  return c.strandId ?? -1;
}

/** Where it stands in the shooting order. Zero for a body that is not a bead,
 * which nothing asks — `beadStrand` is the test for that. */
export function beadOrder(c: Creature): number {
  return c.strandOrder ?? 0;
}

/** Whether this bead has already been shrivelled. Absent and `false` are one
 * state: a bead arrives alive (`StrandState.strandSpent`). */
export function beadIsSpent(c: Creature): boolean {
  return c.strandSpent === true;
}

/**
 * The colour of the bead at this place in the order. Alternating, and **not
 * authored per bead**: what a wave writes is the colour of the one that has to
 * be shot first, and the whole creature is that every neighbour is the other
 * one. `otherColor` rather than a ternary written here, because turning a
 * colour over is a rule the simulation owns (`kinds.ts`).
 */
export function beadColor(head: Color, order: number): Color {
  return order % 2 === 0 ? head : otherColor(head);
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
 * The bead that has to be shot next: the live one lowest in the order, or null
 * when the thread has nothing left on it.
 *
 * Derived rather than stored, and that is what keeps the mark on player 2's
 * screen and the shot the simulation allows one fact. A stored "which one is
 * lit" would be a second copy of a question the field already answers, and it
 * would have to be rewritten on every kill — including the ones a wrong shot
 * takes back.
 */
export function strandHead(world: World, strandId: number): Creature | null {
  let head: Creature | null = null;
  for (const c of world.creatures) {
    if (beadStrand(c) !== strandId || beadIsSpent(c)) continue;
    if (head === null || beadOrder(c) < beadOrder(head)) head = c;
  }
  return head;
}

/** Whether this bead is the one a shot may land on. The one rule render's mark
 * and `beadStruck` both call. */
export function beadIsActive(world: World, c: Creature): boolean {
  if (c.kind !== "strand" || beadIsSpent(c)) return false;
  return strandHead(world, beadStrand(c))?.id === c.id;
}

/** How many beads of this thread are still alive. */
export function strandLeft(world: World, strandId: number): number {
  let left = 0;
  for (const c of world.creatures) {
    if (beadStrand(c) === strandId && !beadIsSpent(c)) left += 1;
  }
  return left;
}

/**
 * Thread the rest of a strand onto the bead that has just arrived, and settle
 * that bead's own place on it.
 *
 * The queue entry becomes the **leftmost** bead — `spawnArrivals` has already
 * pushed it — and this puts the others in the columns to its right, shifting
 * the whole run inside the field when there is not room for it. It is the one
 * place the end the order starts at is rolled, so a bead's colour and its
 * order are decided together and cannot come apart.
 *
 * It mutates that first bead rather than returning a replacement for it,
 * because `world.nextId` is spent inside the object literal next door and a
 * strand's name *is* its first bead's id.
 */
export function stringStrand(world: World, first: Creature, asked: number | undefined): Creature[] {
  const count = strandBeadCount(world.cfg, asked);
  // Which end of the thread the order starts at. One draw whichever way it
  // comes up, so the stream is spent identically and `rng.state` in `hash.ts`
  // is what makes both devices agree about it.
  const fromLeft = nextInt(world.rng, 2) === 0;
  const lo = Math.max(0, Math.min(first.col, world.cfg.cols - count));
  // The colour of the bead that has to be shot first, which is what the wave
  // authored. Not null: a strand names a colour (`authorsColor`).
  const head = first.color ?? "red";
  const born: Creature[] = [];
  for (let place = 0; place < count; place++) {
    const order = fromLeft ? place : count - 1 - place;
    const col = lo + place;
    const color = beadColor(head, order);
    if (place === 0) {
      first.col = col;
      first.fromCol = col;
      first.color = color;
      first.strandId = first.id;
      first.strandOrder = order;
      continue;
    }
    born.push({
      id: world.nextId++,
      kind: "strand",
      col,
      row: first.row,
      // Out of the bead that arrived, so the first frame draws the thread
      // paying itself out rather than five bodies appearing in a row — the
      // same glide THE GYRE's rim comes out of its hub on.
      fromRow: first.fromRow,
      fromCol: first.col,
      color,
      holes: 0,
      petals: 0,
      dragMilli: 0,
      throbOpen: false,
      shell: 0,
      strandId: first.id,
      strandOrder: order,
    });
  }
  return born;
}
