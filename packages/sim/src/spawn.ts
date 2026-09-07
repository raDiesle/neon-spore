import { balloonEntryRow, balloonOnSpawn } from "./balloon.js";
import { beatboxOnSpawn } from "./beatbox.js";
import { caromOnSpawn } from "./carom.js";
import { coilOnSpawn } from "./coil-state.js";
import { growCrawler } from "./crawler-round.js";
import { dartOnSpawn } from "./dart.js";
import { echoOnSpawn } from "./echo.js";
import { fenceOnSpawn } from "./fence.js";
import { fenceCracksOnSpawn } from "./fence-crack.js";
import { ghostOnSpawn } from "./ghost.js";
import { gyreOnSpawn, mountsFor } from "./gyre.js";
import { recoilOnSpawn } from "./recoil.js";
import { rindOnSpawn } from "./rind.js";
import { rockCrossOnSpawn, rockCrossRowFor, rockEntryCol, rockMayCross } from "./rock-cross.js";
import { shellOnSpawn } from "./shell.js";
import { stringStrand } from "./strand-spawn.js";
import { clampSpanCol, colSpan, fallTilesPerBeat, spawnSpan } from "./types.js";
import { veerOnSpawn } from "./veer.js";
import { veilOnSpawn } from "./veil.js";
import { volleyOnSpawn } from "./volley.js";
import { wispOnSpawn } from "./wisp.js";
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
 * That is also why it grows and the other half does not. Every creature added
 * to the bestiary since THE LURE has wanted a field of its own on the beat it
 * enters, and each is one spread line here — a list, in a file that is a
 * list, rather than more lines inside a loop that is a rule.
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
      // A dart arrives already aiming, and already knowing the move after
      // that: it enters on a float beat, so the arrow and the previewed path
      // are over it on player 2's screen for the whole of the glide in. Both
      // sides are rolled here, from the world's own stream, which is why
      // `rng.state` being in `hashWorld` already covers them.
      ...(entry.kind === "dart" ? dartOnSpawn(world, col) : {}),
      // Which body is inside a veil, rolled rather than authored — the one
      // creature in the game whose contents nobody may compose against. It
      // overrides `color` above on purpose: a wave that named one would be
      // fixing the thing docs/spec/structure.md 7.3 puts on the random side
      // of its own table. Same stream, same argument about `rng.state`.
      ...(entry.kind === "veil" ? veilOnSpawn(world) : {}),
      // Where THE WISP is going after its first hop, rolled here for the
      // dart's reason two lines up: the square has to be on the navigator's
      // screen from the frame the body is, or the longest dwell of this
      // creature's life is the one with nothing to say (`wispOnSpawn`).
      ...(entry.kind === "wisp" ? wispOnSpawn(world, col) : {}),
      // Which way a crossing ghost sets off, and a lap count at zero. Absent
      // for a ghost the wave authored `"down"`, and the absence *is* the
      // path — `ghostCrosses` reads it, and a falling ghost carries no field
      // at all, so every wave written before crossing existed is byte-for-byte
      // the same world.
      ...(entry.path === "across" ? ghostOnSpawn(world.cfg.cols, col) : {}),
      // How many divisions this arrival has ahead of it, absent on every other
      // kind — a wave written before THE ECHO is the same world.
      ...(entry.kind === "echo" ? echoOnSpawn(world.cfg, world.beat) : {}),
      // How many layers this arrival has to shed, absent on every other kind —
      // a wave written before THE RIND is the same world.
      ...(entry.kind === "rind" ? rindOnSpawn(world.cfg) : {}),
      // A wheel arrives upright and with no age on it, so the first rim it
      // shows is the one `GYRE_RING` starts at and its turn begins at the
      // slowest it will ever go (`gyre.ts`).
      // How many bounces this arrival has, absent on every other kind — a wave
      // written before THE RECOIL is the same world.
      ...(entry.kind === "recoil" ? recoilOnSpawn(world.cfg) : {}),
      ...(entry.kind === "gyre" ? gyreOnSpawn() : {}),
      // Which columns a wall is open in, as the mask everything downstream
      // reads, and absent on every other kind. Authored rather than rolled and
      // remapped onto the real field before it got here (`queueFromWave`), so
      // both devices are handed the same way through — and the way through is
      // the one thing in this creature the pair has to say out loud.
      ...(entry.kind === "fence" ? { fenceGaps: fenceOnSpawn(world.cfg, entry.gaps) } : {}),
      // And where it is cracked, which is the other half of the same arrival:
      // the columns a bolt opens and the colour each of them wants. Authored
      // and remapped exactly as the gaps are, so both devices are handed the
      // same breaking points — and a crack is the one thing about this wall
      // the pair has to say *two* words about (`fence-crack.ts`).
      ...(entry.kind === "fence"
        ? fenceCracksOnSpawn(world.cfg, entry.cracksRed, entry.cracksCyan)
        : {}),
      // Which way THE CAROM sets off, and absent on every other kind — so a
      // body that never crosses carries no field at all and every wave written
      // before this creature is byte-for-byte the same world. Derived from the
      // column and the field's width rather than rolled: both screens see the
      // heading from the first frame, and what the pair cannot do is be there
      // (`caromOnSpawn`).
      ...(entry.kind === "carom" ? caromOnSpawn(world.cfg, col, span) : {}),
      // Which way THE COIL sets off, absent on every other kind — a wave
      // written before this creature is the same world. Always left, which is
      // what "it comes in at the right wall" means once the wave has put it in
      // a column: nothing is rolled or read off the field's width
      // (`coilOnSpawn`). The charge it may one day be sent is not here — an
      // arrival is never already chained.
      ...(entry.kind === "coil" ? coilOnSpawn() : {}),
      // Every plate of shell on, and absent on every other kind — so a body
      // the shield simply removes carries no field at all and every wave
      // written before THE VOLLEY is byte-for-byte the same world. It is the
      // whole of what a volley arrives with: it falls like a rock from here,
      // and a rock needs no state to do that (`volleyOnSpawn`).
      ...(entry.kind === "volley" ? volleyOnSpawn(world.cfg) : {}),
      // Which side THE VEER's first change of lane takes, rolled here for the
      // dart's reason far above: the arrow has to be over the rider from the
      // frame the rock is on the field, or the three rows before the first
      // change are three rows with nothing for the pilot to say. Absent on
      // every other kind, so a rock that holds its lane carries no field at
      // all and every wave written before this creature is the same world.
      ...(entry.kind === "veer" ? veerOnSpawn(world, col) : {}),
      // Which way a rock crosses the field, and the row it crosses along —
      // absent on a rock that falls, so every wave written before crossing
      // existed is byte-for-byte the same world. `rockMayCross` is asked here
      // rather than trusted from the wave: a route on a body that already
      // moves by a rule of its own would be a body stepped twice in one beat
      // (`own-step.ts`), and a stale entry must not be able to buy one.
      // How many beats this box asks for, absent on every other kind. Authored,
      // never rolled — the count is the sentence the pilot has to say
      // (`beatboxOnSpawn`). The tally and its beat are not here — never part
      // way through a run.
      ...(entry.kind === "beatbox" ? beatboxOnSpawn(world.cfg, entry.beats) : {}),
      ...(across === undefined ? {} : rockCrossOnSpawn(across, row)),
      // How many times THE BALLOON still splits, the beat it started swelling,
      // its heading and its speed — absent on every other kind. The heading is
      // derived rather than rolled, for `caromOnSpawn`'s reason.
      ...(rises ? balloonOnSpawn(world.cfg, world.beat, col, span, entry.rise) : {}),
    });
    // A gyre is the one arrival that brings bodies with it: six on its rim,
    // alternating, built from the hub that was just pushed so that they are
    // already in their rim positions on the frame it enters. Nothing else in
    // the game spawns more than the entry named, which is why this is the one
    // place a queue entry becomes more than one creature.
    if (entry.kind === "gyre") {
      const hub = world.creatures[world.creatures.length - 1]!;
      world.creatures.push(...mountsFor(world, hub));
    }
    // And a strand is the second, on the same terms with one difference: the
    // entry itself *is* one of the bodies. It becomes the leftmost bead of the
    // thread and `stringStrand` hangs the rest to its right — settling that
    // first bead's own colour and place in the order on the way, because both
    // follow from a roll that cannot be taken until the count is known.
    if (entry.kind === "strand") {
      const first = world.creatures[world.creatures.length - 1]!;
      world.creatures.push(...stringStrand(world, first, entry.beads));
    }
    // And a crawler is the third, on the strand's terms: the entry itself is
    // the **head** and `growCrawler` hangs the segments and the tail out
    // behind it, settling the head's own wall, row and heading on the way.
    // Every link but the head starts off the field, so the worm feeds itself
    // onto the ship a link at a time whatever length the wave asked for.
    if (entry.kind === "crawler") {
      const head = world.creatures[world.creatures.length - 1]!;
      world.creatures.push(...growCrawler(world, head, entry.segments, entry.side));
    }
    world.spawned += 1;
  }
}
