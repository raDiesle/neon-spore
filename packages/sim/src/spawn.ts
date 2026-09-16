import { balloonEntryCol, balloonEntryRow, balloonEntrySide } from "./balloon-entry.js";
import { minePlaceRow } from "./mine.js";
import { rockCrossRowFor, rockEntryCol, rockMayCross } from "./rock-cross.js";
import { shellOnSpawn } from "./shell.js";
import { companionsOnSpawn } from "./spawn-companions.js";
import { kindFieldsOnSpawn } from "./spawn-fields.js";
import { clampSpanCol, colSpan, fallTilesPerBeat, spawnSpan } from "./types.js";
import type { SpawnEntry, World } from "./world.js";

/**
 * **An arrival becoming a body.** One queue entry in, one creature out — or
 * seven, for the one kind that brings a rim with it.
 *
 * Split out of `beat.ts` when THE GYRE arrived and that file went over its
 * limit, and the seam is the one the file already had a blank line at:
 * everything left next door is what happens to bodies that are *already*
 * standing — they fall, they step, they divide, they reach the hull — and this
 * is the single place a body comes into existence at all.
 *
 * That is also why it grew and the other half did not. Every creature added
 * to the bestiary since THE LURE has wanted a field of its own on the beat it
 * enters, and each was one spread line here until the file stood on its limit
 * with the next creature unable to enter. The list of what one kind brings and
 * no other does is `spawn-fields.ts` now, and the three arrivals that are more
 * than one body are `spawn-companions.ts`; what stays here is the arrival
 * itself — the place, the glide in, the fields every body has.
 */

/**
 * Everything the queue owes as of this beat. Called from `onBeat` after the
 * bodies already on the field have moved and before the hull is resolved: an
 * arrival stands on the row it entered at for the beat it entered on, so both
 * players see it before anything asks whether it has got anywhere.
 *
 * `held` is beats the queue has spent standing still, which is nought for
 * every wave but one: THE REPRISE stops the script while it sends a stretch of
 * it again unseen, and it stops it by *holding the clock this reads* rather
 * than by reaching in here (`reprise.ts`). So the wave beat an arrival is owed
 * on is the wave's own beat less whatever it has spent held, and nothing in
 * this file knows what a boss is.
 */
export function spawnArrivals(world: World, held: number): void {
  // Spawn creatures from the queue. Wave entries are authored to beat 0..N,
  // and they enter at the top (row 0) and move normally from there.
  // "They appear when their beat has passed" means: if we're at beat 5, a
  // creature with beat 3 should already exist, so spawn at beat >= waveBeat - 1
  // (one beat *before* the current one, because creatures then move once and
  // stand on beat waveBeat).
  const seen = world.waveBeat - held;
  while (world.spawned < world.queue.length) {
    const entry = world.queue[world.spawned]!;
    if (entry.beat > seen - 1) break;
    spawnOne(world, entry);
    world.spawned += 1;
  }
}

/**
 * One entry becoming its bodies — the whole of an arrival, and the queue's
 * cursor is not moved here.
 *
 * Its own function because the queue is read twice: once forwards by the loop
 * above, and once again by THE REPRISE, which sends a stretch of the script
 * back at the pair with nothing drawn (`reprise.ts`). What "unseen" means is
 * written onto the bodies by that file afterwards; an arrival is an arrival
 * here, and there is one place it is made.
 */
export function spawnOne(world: World, entry: SpawnEntry): void {
  // How wide this arrival is. A rock's width is authored (`SpawnEntry.size`)
  // rather than fixed by its kind, so the clamp that keeps a body's whole
  // span on the field has to be told the real number — a two-wide meteor
  // authored in the last column would otherwise hang half off the edge.
  // `spawnSpan` and not `spanOf`: THE FENCE is the width of the field, which
  // is not a fact about its kind and is not a number `colSpan` is handed the
  // configuration to answer. The width is written onto the body below, so
  // every later reader — the shield's column test, the shot that passes
  // through, the fingerprint — asks `spanOf` about it like anything else.
  const span = spawnSpan(world.cfg.cols, entry);
  // A rock the wave sent **across** does not come in at the top and does not
  // come in where it was painted: it enters at the wall it walks away from,
  // in the row the wave named, already travelling (`rock-cross.ts`). So the
  // place is settled here rather than below, and every other arrival keeps
  // the column it was authored in and the row nought it has always had.
  const across = entry.cross !== undefined && rockMayCross(entry.kind) ? entry.cross : undefined;
  const rises = entry.kind === "balloon";
  // **A mine is already there.** It enters in the column it was authored in
  // like an ordinary arrival and on the *row* it was authored on, which no
  // falling body has: the tile is the whole sentence, so where it stands is
  // the wave's to write down rather than something the field works out.
  // `minePlaceRow` pulls that row into the band and steps it clear of any
  // mine already standing (`mine.ts`).
  const stands = entry.kind === "mine";
  // **THE BALLOON comes in at a wall and glides to the middle**, which is the
  // owner's rule of 14 September 2026: it used to appear out of nothing one
  // row above the ship and swell there, which made the arrival a place the
  // pair already knew. The wall is the authored column's own side, the row is
  // one or two above the shield and the column it settles in is somewhere
  // around the middle — all three in `balloon-entry.ts`.
  const col = rises
    ? balloonEntryCol(world.cfg, world.rng, span)
    : across === undefined
      ? clampSpanCol(entry.col, world.cfg.cols, span)
      : rockEntryCol(world.cfg.cols, span, across);
  // The wall it slides out of: the picture's `fromCol` for that one beat.
  const wall = rises
    ? rockEntryCol(world.cfg.cols, span, balloonEntrySide(world.cfg, entry.col))
    : 0;
  const row = rises
    ? balloonEntryRow(world.cfg, world.rng)
    : stands
      ? minePlaceRow(world, col, entry.row)
      : across === undefined
        ? 0
        : rockCrossRowFor(world.cfg, entry.row);
  // Said once, at the top of the field, so player 2's ear has the column
  // before the eye has found the ring — haste, never surprise.
  if (entry.kind === "lure") world.events.push({ type: "lureSeen", col });
  world.creatures.push({
    id: world.nextId++,
    kind: entry.kind,
    col,
    row,
    // Glide onto the field at the kind's own speed, not a flat one tile —
    // a torch (`fallTilesPerBeat` far above 1) that crept in for its first
    // beat and only then jumped to full speed read as a stutter, not a fall.
    // A dart takes the default one tile and is right to: its two-row stride
    // is what it does *after* it has arrived, and entering on it would put
    // the first diagonal off the top of the field where nobody sees it.
    //
    // A crossing rock glides in **sideways** instead, out of the wall it
    // entered at: it has no fall to be drawn making, and a body that slid
    // down from off the top edge into the middle of the field would be a
    // picture of the arrival it deliberately is not.
    // A mine has no entrance at all: it is on its tile from the first frame,
    // which is the only arrival a thing that was *placed* can have.
    fromRow: rises || stands || across !== undefined ? row : -fallTilesPerBeat(entry.kind),
    // A balloon glides in **sideways out of a wall**, which is a crossing
    // rock's own arrangement one creature along: `fromCol` is the wall and
    // `col` is where it stops, so the picture carries it in along the row it
    // will climb from. For that one beat the body is genuinely out over the
    // field between the two (`creatureLane`), which is why a bolt fired up
    // the column it is heading for misses it.
    fromCol: rises ? wall : across === undefined ? col : col - across * span,
    color: entry.color,
    // Only when the wave asked for something other than the kind's own
    // width: `spanOf` falls back to `colSpan`, so an unsized arrival carries
    // no field at all and every wave written before sizes existed is
    // byte-for-byte the same world.
    ...(span === colSpan(entry.kind) ? {} : { span }),
    // Authored by the wave, and the same value on both devices. Which of the
    // two screens lays an alarm over the body it names is render's question
    // and never the simulation's (`Creature.wears`).
    ...(entry.wears ? { wears: entry.wears } : {}),
    holes: 0,
    petals: 0,
    dragMilli: 0,
    // Every piece on, for the one kind that wears any. The colour under
    // them is deliberately *not* settled here: a shelled body arrives with
    // `color` null and gets one only when the last piece comes off, so
    // there is no instant at which anything — render included — could have
    // shown the pair something they were not meant to know yet.
    shell: shellOnSpawn(entry.kind),
    // And whatever this one kind of body arrives with and no other kind
    // does — its rolls, its masks, its heading (`spawn-fields.ts`).
    ...kindFieldsOnSpawn(world, entry, { col, row, span, across, rises }),
  });
  // A gyre brings its rim, a strand its beads, a crawler its links — the
  // three arrivals that are more than one body (`spawn-companions.ts`).
  world.creatures.push(...companionsOnSpawn(world, entry));
}
