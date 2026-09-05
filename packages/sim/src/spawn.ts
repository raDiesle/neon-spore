import { caromOnSpawn } from "./carom.js";
import { throbIsOpen } from "./creature-rules.js";
import { dartOnSpawn } from "./dart.js";
import { echoOnSpawn } from "./echo.js";
import { ghostOnSpawn } from "./ghost.js";
import { gyreOnSpawn, mountsFor } from "./gyre.js";
import { recoilOnSpawn } from "./recoil.js";
import { rindOnSpawn } from "./rind.js";
import { shellOnSpawn } from "./shell.js";
import { stringStrand } from "./strand-spawn.js";
import { clampSpanCol, colSpan, fallTilesPerBeat, spanOf } from "./types.js";
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
 * enters, and each is one spread line here (`dartOnSpawn`, `veilOnSpawn`,
 * `ghostOnSpawn`, `echoOnSpawn`, `rindOnSpawn`, `recoilOnSpawn`, `gyreOnSpawn`) — a list, in a
 * file that is a list, rather than more lines inside a loop that is a rule.
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
    const span = spanOf(entry);
    const col = clampSpanCol(entry.col, world.cfg.cols, span);
    // Said once, at the top of the field, so player 2's ear has the column
    // before the eye has found the ring. A hit should always be player 2's
    // haste and never player 2's surprise.
    if (entry.kind === "lure") world.events.push({ type: "lureSeen", col });
    world.creatures.push({
      id: world.nextId++,
      kind: entry.kind,
      col,
      row: 0,
      // Glide onto the field at the kind's own speed, not a flat one tile —
      // a torch (`fallTilesPerBeat` far above 1) that crept in for its first
      // beat and only then jumped to full speed read as a stutter, not a fall.
      // A dart takes the default one tile and is right to: its two-row stride
      // is what it does *after* it has arrived, and entering on it would put
      // the first diagonal off the top of the field where nobody sees it.
      fromRow: -fallTilesPerBeat(entry.kind),
      fromCol: col,
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
      throbOpen: entry.kind === "throb" && throbIsOpen(world.cfg, world.beat),
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
      // How many divisions this arrival has ahead of it, and absent on every
      // other kind — so a body that never divides carries no field at all and
      // every wave written before THE ECHO is byte-for-byte the same world.
      ...(entry.kind === "echo" ? echoOnSpawn(world.cfg, world.beat) : {}),
      // How many layers this arrival still has to shed, and absent on every
      // other kind — so a body that wears no skin of its own carries no field
      // at all and every wave written before THE RIND is byte-for-byte the
      // same world.
      ...(entry.kind === "rind" ? rindOnSpawn(world.cfg) : {}),
      // A wheel arrives upright and with no age on it, so the first rim it
      // shows is the one `GYRE_RING` starts at and its turn begins at the
      // slowest it will ever go (`gyre.ts`).
      // How many bounces this arrival still has in it, and absent on every
      // other kind — so a body a shot simply kills carries no field at all and
      // every wave written before THE RECOIL is byte-for-byte the same world.
      ...(entry.kind === "recoil" ? recoilOnSpawn(world.cfg) : {}),
      ...(entry.kind === "gyre" ? gyreOnSpawn() : {}),
      // Which way THE CAROM sets off, and absent on every other kind — so a
      // body that never crosses carries no field at all and every wave written
      // before this creature is byte-for-byte the same world. Derived from the
      // column and the field's width rather than rolled: both screens see the
      // heading from the first frame, and what the pair cannot do is be there
      // (`caromOnSpawn`).
      ...(entry.kind === "carom" ? caromOnSpawn(world.cfg, col, span) : {}),
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
    world.spawned += 1;
  }
}
