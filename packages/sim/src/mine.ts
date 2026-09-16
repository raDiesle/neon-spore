import { hullRow, type SimConfig } from "./config.js";
import { removeCreature } from "./field.js";
import { breachHull } from "./hull-damage.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MINE: a wisp standing still, answered by a thumb instead of a bolt.
 *
 * THE WISP hides *where* a body is from the seat holding the cannon, and the
 * answer is still a shot — player 2 says a tile and player 1 puts the gun on
 * it. This one takes the gun out of the sentence. The body appears on a tile
 * and never moves; one seat is drawn it, the other is looking at an empty
 * field, and the only thing that answers it is **that seat's finger on that
 * exact square**. So the tile has to cross the room as words and then be found
 * by a hand rather than by a control that snaps to a column: a column is seven
 * places and a tile is a hundred and fifty, and there is no strip to slide
 * along until the letter is right.
 *
 * **What a wrong finger costs is the whole creature.** The four tiles around
 * it break the hull in its colour — near enough to have been meant, so the
 * price of guessing the last square is the wave. Anywhere else costs a beat
 * off the fuse and nothing more: feeling around the field is allowed and it is
 * never free, which is what makes the *count* the pair's shared clock rather
 * than a timer they watch. The fuse running out is the hull too.
 *
 * **It is never a shot.** A bolt bounces off one (`bullet-refused.ts`), on the
 * owner's rule that a body the cannon cannot answer still stops the bolt — and
 * here that rule has a second reason under it: on a wave that draws the mine
 * to the pilot, a bolt that killed one would hand the seat holding the cannon
 * both halves of the sentence at once.
 *
 * **Which seat sees it is the wave's**, not this file's (`SpawnEntry.sees`),
 * which is the first time in this game that a split is authored rather than
 * fixed by the kind. `Creature.mineSees` carries the answer onto the body so
 * that render, the duty word and the rule below all read the same field
 * (`render/duty-mine.ts` says why the word had to move with it).
 */

/** The topmost row a mine may stand on. Two rather than nought: a body that
 * appeared in the first row would be drawn half under the radar strip on the
 * seat that can see it, and a tile nobody can point at is not a tile. */
const TOP_ROW = 2;

/** How far above the hull the lowest one stands: the hull row itself, and the
 * row the shield sweeps. A mine on either would be answered by the dome
 * arriving rather than by anybody's finger. */
const CLEAR_ROWS = 2;

/** The band a mine may be placed in, ends included — rows two to twelve on the
 * shipped field. Exported because the blind seat's own instrument sweeps
 * exactly these rows and must not invent its own bounds (`wispRows`' reason,
 * one creature along). */
export function mineRows(cfg: SimConfig): { top: number; bottom: number } {
  return { top: TOP_ROW, bottom: Math.max(TOP_ROW, hullRow(cfg) - CLEAR_ROWS) };
}

/**
 * Where the arrival actually stands: the authored row pulled into the band,
 * and then stepped down — and up, if the field runs out below — until it is
 * not on or beside a mine already standing.
 *
 * **Never beside another mine**, because the four tiles round a mine are the
 * ones that break the hull: two mines a square apart would make a tile that is
 * a neighbour of one and the answer to the other, and the pair would be told
 * the same tile is both the finger and the mistake.
 *
 * One deterministic walk and no draw at all. Nothing about this creature is
 * rolled — the tile *is* the sentence, and a wave cannot be composed against a
 * square its author does not know.
 */
export function minePlaceRow(world: World, col: number, row: number | undefined): number {
  const { top, bottom } = mineRows(world.cfg);
  const from = Math.max(top, Math.min(bottom, row ?? top));
  for (let r = from; r <= bottom; r++) if (mineTileIsFree(world, col, r)) return r;
  for (let r = from - 1; r >= top; r--) if (mineTileIsFree(world, col, r)) return r;
  return from;
}

/** A tile with no mine on it and none in the four squares round it. */
function mineTileIsFree(world: World, col: number, row: number): boolean {
  return !world.creatures.some((c) => c.kind === "mine" && tileDistance(c, col, row) <= 1);
}

/** How far a tile is from a body, in tiles along the two axes added together.
 * Nought is the body's own square and one is each of the four beside it — the
 * diagonals are two, and they are safe, which is what the four arms of the
 * silhouette are drawn saying (`content/silhouettes-mine.ts`). */
function tileDistance(c: Creature, col: number, row: number): number {
  return Math.abs(c.col - col) + Math.abs(c.row - row);
}

/**
 * What a mine arrives with: a full fuse and the seat it is drawn on.
 *
 * The seat is defaulted here rather than left absent, unlike every other
 * field a kind brings with it, and the asymmetry is the point: absent would
 * mean *neither seat sees it*, which is a body nobody can answer. Two is the
 * navigator's, which is the seat a wisp is drawn on and the seat `TALKER` and
 * `DUTY_WORD` are both written against.
 */
export function mineOnSpawn(cfg: SimConfig, sees: 1 | 2 | undefined): Partial<Creature> {
  return { mineFuse: cfg.mineFuseBeats, mineSees: sees ?? 2 };
}

/** The seat a mine is drawn on. The one place the default is spelled, so a
 * body built by hand in a test reads the same way the field does. */
export function mineSeenBy(c: Creature): 1 | 2 {
  return c.mineSees === 1 ? 1 : 2;
}

/** Beats left on this one, for the screen that draws the count — which is both
 * of them, because the count is the only thing about this creature the blind
 * seat is allowed to know. */
export function mineFuseLeft(cfg: SimConfig, c: Creature): number {
  return Math.max(0, c.mineFuse ?? cfg.mineFuseBeats);
}

/** Whether anything on the field is a mine. Exported because it is the second
 * switch on the coordinate grid, and render must ask it rather than filter for
 * the kind by hand (`wispOnField`'s reason exactly). */
export function mineOnField(world: World): boolean {
  return world.creatures.some((c) => c.kind === "mine");
}

/**
 * One beat of a mine, in place of the fall every other kind takes: the fuse
 * comes down by one, and at nought the ship pays.
 *
 * **Each mine runs its own**, from the beat it appeared, and that is why the
 * number is on the body rather than read off `world.beat` the way a wisp's hop
 * is. A wisp's clock is shared because every wisp hops together and the pair
 * reads one count; two mines put down four beats apart are two separate
 * sentences with two separate deadlines, and a shared clock would make the
 * second one's count a lie on the screen of the seat that has to act on it.
 */
export function stepMine(world: World, c: Creature): void {
  const left = mineFuseLeft(world.cfg, c) - 1;
  c.mineFuse = left;
  if (left <= 0) mineGoesOff(world, c);
}

/** The fuse out: the hull broken in the column the body was standing in, in
 * its own colour, and the body gone. `breachHull` and not a kill of its own,
 * so the scar, the sound and the lost wave are the one thing they are for
 * every other body that reaches the ship. */
function mineGoesOff(world: World, c: Creature): void {
  breachHull(world, c.col, "mine", c.row, "light", c.color);
  removeCreature(world, c.id);
}

/**
 * A finger on a tile, from the seat that cannot see what is on it.
 *
 * **Only the blind seat's press counts**, and it is a rule about the creature
 * rather than about the control, which is `beatboxTapped`'s arrangement word
 * for word: the command says what was pressed and the creature says whose
 * press it was. The seat that is drawn the body has nothing to find.
 *
 * The three answers, in the order they are asked:
 *
 * - **The exact tile kills it outright**, and that is the only thing in the
 *   game a blind finger can do to a body.
 * - **One of the four beside it breaks the hull**, in the mine's colour. Near
 *   enough to have been meant: what it costs is the wave, because a pair that
 *   has the square to within one tile has already been told the square.
 * - **Anywhere else takes a beat off every fuse this seat owes.** Feeling
 *   around is allowed and is never free, and it is charged to all of them
 *   rather than to the nearest because *nearest* is a fact about where the
 *   bodies are — which is precisely what this seat may not know.
 */
export function mineTapped(world: World, player: 1 | 2, col: number, row: number): void {
  const owed = world.creatures.filter((c) => c.kind === "mine" && mineSeenBy(c) !== player);
  if (owed.length === 0) return;
  const exact = owed.find((c) => tileDistance(c, col, row) === 0);
  if (exact) {
    world.events.push({
      type: "destroy",
      col: exact.col,
      row: exact.row,
      // A mine's colour is the wave's and it may have left it out; cyan is
      // what every other colourless body's kill already says (`balloon-rub.ts`).
      color: exact.color ?? "cyan",
      kind: "mine",
    });
    removeCreature(world, exact.id);
    return;
  }
  const beside = owed.find((c) => tileDistance(c, col, row) === 1);
  if (beside) {
    breachHull(world, col, "mine", row, "light", beside.color);
    return;
  }
  // A miss, and the pair is told so where the finger landed rather than where
  // the bodies are: `reject` is the same word a wrong colour gets, and it says
  // *not this* without saying anything about what would have been right.
  world.events.push({ type: "reject", col, row });
  // And a fuse a wrong finger ran out is a fuse out: the same end by the same
  // call, so a pair that felt its way past the last beat pays what a pair that
  // said nothing at all would have (`stepMine`).
  for (const c of owed) {
    c.mineFuse = mineFuseLeft(world.cfg, c) - 1;
    if (c.mineFuse <= 0) mineGoesOff(world, c);
  }
}
