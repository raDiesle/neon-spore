import { balloonEntryRow } from "./balloon.js";
import { rockCrossRowFor, rockEntryCol, rockMayCross } from "./rock-cross.js";
import { shellOnSpawn } from "./shell.js";
import { companionsOnSpawn } from "./spawn-companions.js";
import { kindFieldsOnSpawn } from "./spawn-fields.js";
import { clampSpanCol, colSpan, fallTilesPerBeat, spawnSpan } from "./types.js";
import type { World } from "./world.js";

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
 */
export function spawnArrivals(world: World): void {
  // Spawn creatures from the queue. Wave entries are authored to beat 0..N,
  // and they enter at the top (row 0) and move normally from there.
  // "They appear when their beat has passed" means: if we're at beat 5, a
  // creature with beat 3 should already exist, so spawn at beat >= waveBeat - 1
  // (one beat *before* the current one, because creatures then move once and
  // stand on beat waveBeat).
  while (world.spawned < world.queue.length) {
    const entry = world.queue[world.spawned]!;
    if (entry.beat > world.waveBeat - 1) break;
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
    const col =
      across === undefined
        ? clampSpanCol(entry.col, world.cfg.cols, span)
        : rockEntryCol(world.cfg.cols, span, across);
    // THE BALLOON does not enter at the top and does not glide in either: it
    // appears one row above the ship and swells there (`balloonEntryRow`), so
    // its row and both `from` fields are settled here, beside the crossing
    // rock's.
    const rises = entry.kind === "balloon";
    const row = rises
      ? balloonEntryRow(world.cfg)
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
      fromRow: rises || across !== undefined ? row : -fallTilesPerBeat(entry.kind),
      fromCol: rises || across === undefined ? col : col - across * span,
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
    world.spawned += 1;
  }
}
