import { balloonOnSpawn } from "./balloon.js";
import { beatboxOnSpawn } from "./beatbox.js";
import { caromOnSpawn } from "./carom.js";
import { coilOnSpawn } from "./coil-state.js";
import { countdownOnSpawn } from "./countdown.js";
import type { Creature } from "./creature-types.js";
import type { CrossDir } from "./cross.js";
import { crystalOnSpawn } from "./crystal.js";
import { dartOnSpawn } from "./dart.js";
import { echoOnSpawn } from "./echo.js";
import type { SpawnEntry } from "./entries.js";
import { fenceOnSpawn } from "./fence.js";
import { fenceCracksOnSpawn } from "./fence-crack.js";
import { ghostOnSpawn } from "./ghost.js";
import { gyreOnSpawn } from "./gyre.js";
import { mineOnSpawn } from "./mine.js";
import { moultOnSpawn } from "./moult.js";
import { recoilOnSpawn } from "./recoil.js";
import { rindOnSpawn } from "./rind.js";
import { rockCrossOnSpawn } from "./rock-cross.js";
import { veerOnSpawn } from "./veer.js";
import { veilOnSpawn } from "./veil.js";
import { volleyOnSpawn } from "./volley.js";
import { wispOnSpawn } from "./wisp.js";
import type { World } from "./world.js";

/**
 * **What a kind brings with it on the beat it enters** — the fields on a body
 * that only one creature has, absent on every other, so that a wave written
 * before that creature existed is byte-for-byte the same world.
 *
 * Split out of `spawn.ts` on 14 September 2026, when that file stood at
 * exactly its limit and its own header said why it would grow: every creature
 * since THE LURE has wanted a line here. `spawn.ts` keeps the arrival itself —
 * the place, the glide in, the fields every body has — and this is the list
 * it spreads over the end of that.
 *
 * **The order is the fingerprint.** The dart, the veil, the wisp, THE COUNT
 * and THE VEER each roll from `world.rng` here, and a spread evaluates in the
 * order it is written, so moving one line moves every roll after it and both
 * devices desync on a wave that was fine yesterday. Add at the end.
 */

/** Where the arrival has been placed, as `spawnArrivals` settled it. */
export interface Placed {
  readonly col: number;
  readonly row: number;
  readonly span: number;
  /** The direction of a rock the wave sent across, or undefined for a body that falls. */
  readonly across: CrossDir | undefined;
  /** THE BALLOON: it does not enter at the top. */
  readonly rises: boolean;
}

export function kindFieldsOnSpawn(world: World, entry: SpawnEntry, at: Placed): Partial<Creature> {
  const { col, row, span, across, rises } = at;
  return {
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
    // How many bounces this arrival has, absent on every other kind — a wave
    // written before THE RECOIL is the same world.
    ...(entry.kind === "recoil" ? recoilOnSpawn(world.cfg) : {}),
    // A wheel arrives upright and with no age on it (`gyre.ts`).
    ...(entry.kind === "gyre" ? gyreOnSpawn() : {}),
    // Where THE COUNT's rim starts in its period, rolled for the veil's
    // reason: a phase read off the arrival is one the navigator could keep.
    ...(entry.kind === "countdown" ? countdownOnSpawn(world) : {}),
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
    // Which way THE CAROM sets off — and THE CRYSTAL, on the same terms —
    // absent on every other kind, so a body that never crosses carries no
    // field and every earlier wave is byte-for-byte the same world. Derived
    // from the column and the field's width rather than rolled: both screens
    // see the heading from the first frame (`caromOnSpawn`, `crystalOnSpawn`).
    ...(entry.kind === "carom" ? caromOnSpawn(world.cfg, col, span) : {}),
    ...(entry.kind === "crystal" ? crystalOnSpawn(world.cfg, col, span) : {}),
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
    // change have nothing for the pilot to say. Absent on every other kind.
    ...(entry.kind === "veer" ? veerOnSpawn(world, col) : {}),
    // How many beats this box asks for, absent on every other kind. Authored,
    // never rolled — the count is the sentence the pilot has to say
    // (`beatboxOnSpawn`). The tally and its beat are not here — never part
    // way through a run.
    ...(entry.kind === "beatbox" ? beatboxOnSpawn(world.cfg, entry.beats) : {}),
    // Which way a rock crosses the field, and the row it crosses along —
    // absent on a rock that falls, so every wave written before crossing
    // existed is byte-for-byte the same world. `rockMayCross` is asked here
    // rather than trusted from the wave: a route on a body that already
    // moves by a rule of its own would be a body stepped twice in one beat
    // (`own-step.ts`), and a stale entry must not be able to buy one.
    ...(across === undefined ? {} : rockCrossOnSpawn(across, row)),
    // How many times THE BALLOON still splits, the beat it started swelling,
    // its heading and its speed — absent on every other kind. The heading is
    // derived rather than rolled, for `caromOnSpawn`'s reason.
    ...(rises ? balloonOnSpawn(world.cfg, world.beat, col, span, entry.rise) : {}),
    // A full fuse and the seat the wave drew this one to, absent on every
    // other kind. Authored, never rolled, and the seat is the first split in
    // this game a wave chooses rather than the kind (`mineOnSpawn`). Last in
    // the spread because nothing here rolls, and the order above is the
    // fingerprint.
    ...(entry.kind === "mine" ? mineOnSpawn(world.cfg, entry.sees) : {}),
    // What a moult is carrying, absent on every other kind. Authored, never
    // rolled, and it is the body's *whole* state: which form it is in is a
    // pure function of the beat and is deliberately not stored (`moult.ts`).
    ...(entry.kind === "moult" ? moultOnSpawn(entry.cargo) : {}),
  };
}
