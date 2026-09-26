import { installAntiphon } from "./antiphon-step.js";
import { installBaton } from "./baton-step.js";
import { installCurtain } from "./curtain-step.js";
import { installFilament } from "./filament-step.js";
import { installGimbal } from "./gimbal-step.js";
import { installGorge } from "./gorge-step.js";
import { installHasp } from "./hasp-step.js";
import { installHive } from "./hive-step.js";
import { installInstar, installNettle } from "./instar-step.js";
import { installKeel } from "./keel-step.js";
import { installLead } from "./lead-step.js";
import { installLedger } from "./ledger-step.js";
import { installMantle } from "./mantle-step.js";
import { installRatchet } from "./ratchet-step.js";
import { installScuttle } from "./scuttle-step.js";
import { installSinew } from "./sinew-step.js";
import { installSpool } from "./spool-step.js";
import { installSurge } from "./surge-step.js";
import { installTaster } from "./taster-step.js";
import { installThroat } from "./throat-step.js";
import { installUndertow } from "./undertow-step.js";
import type { BossEntry, World } from "./world.js";

/**
 * **Which clock boss a wave installs, and what each of them leaves on the
 * field** — the choreographed bosses' half of `wave-boss.ts`.
 *
 * Cut out of that file on 17 September 2026, when THE LEAD's branch put it at
 * 250 exactly and its comments had been shortened to make room, which is the
 * wrong fix twice. The seam is the one `bosses-clocks.ts`,
 * `config-boss-clocks.ts` and `boss-entries-clocks.ts` already cut: next door
 * is a boss with a *place* or a round with a picture of its own, and
 * everything here is a boss from `docs/spec/bosses-choreographed.md`, which
 * is the half that grows — one branch a boss, and the next one goes here.
 *
 * **Every branch still says what the boss leaves on the field**, by name and
 * with the reason, for `wave-boss.ts`'s reason: "no creature and no row" is a
 * promise the fall loop, the hull and a hand are written against. None of
 * these leaves one — the one that does, THE CURTAIN's fabric, says so.
 *
 * `isClockEntry` is the guard the caller narrows on, `render`'s
 * `isClockBoss` made for entries, so the chain here is over exactly the
 * kinds it installs and a new one is a compile error until its branch is in.
 */

/** The kinds this file installs. Appended, like every list of boss kinds. */
const CLOCK_KINDS = [
  "baton",
  "throat",
  "undertow",
  "gorge",
  "curtain",
  "taster",
  "ledger",
  "sinew",
  "surge",
  "lead",
  "scuttle",
  "antiphon",
  "hive",
  "instar",
  "filament",
  "gimbal",
  "spool",
  "hasp",
  "ratchet",
  "nettle",
  "mantle",
  "keel",
] as const;

export type ClockEntry = Extract<BossEntry, { kind: (typeof CLOCK_KINDS)[number] }>;

export function isClockEntry(boss: BossEntry): boss is ClockEntry {
  return (CLOCK_KINDS as readonly string[]).includes(boss.kind);
}

export function installClockBoss(world: World, boss: ClockEntry): void {
  if (boss.kind === "baton") {
    // No creature and no row of its own: the arm hangs in the middle column
    // and the bead in it is not a body, so the fall loop, the hull and a hand
    // find nothing of it. What it does put on the field it puts there as
    // ordinary things — a shed segment is a meteor and the bead's last drop
    // is a pod — so every rule that meets one is a rule that already exists
    // (`baton-step.ts`). The arrivals around it are the wave's own.
    world.boss = installBaton(world);
  } else if (boss.kind === "throat") {
    // No creature either, and here the absence is the mechanic rather than the
    // geometry: the gullet hangs from the top down to `throatMouthRow` and its
    // mouth walks that row, but nothing of it is a body — so it cannot be shot,
    // warded or taken hold of, and **shots pass straight through the tube**,
    // which is what leaves player 2 an answer to a creature about to be eaten.
    // The arrivals underneath are the wave author's, and they are also the
    // boss's dinner (`throat.ts`, `bossFillsWave`).
    world.boss = installThroat(world);
  } else if (boss.kind === "undertow") {
    // No creature and no row, and for the first time nothing *above* the
    // hull either: the whole of it is underneath, so the fall loop and a
    // hand find nothing, and the hull meets it only as its own scars — a lobe
    // withdrawn untaken is written straight into `world.scars`, and the last
    // lobe not held is `breachHull` like any other hit (`undertow-step.ts`).
    // The arrivals over it are the wave's own (`bossFillsWave`).
    world.boss = installUndertow(world);
  } else if (boss.kind === "gorge") {
    // No creature and no row: a sack above the grid that swallows what the
    // pair fires past the field, and falls only what they overfed it with
    // (`gorge-step.ts`).
    world.boss = installGorge(world);
  } else if (boss.kind === "curtain") {
    // A creature *and* a fixture: the fabric is a boss body the carry moves,
    // at `curtainRow`, and the core behind it is a column and a colour with
    // no body at all (`curtain-step.ts`).
    world.boss = installCurtain(world);
  } else if (boss.kind === "taster") {
    // No creature and no row: a crest hugging the top of the field with a fan
    // of blades standing out of it, none of which falls. What it answers is
    // what the pair has spent answering the wave (`taster-step.ts`).
    world.boss = installTaster(world);
  } else if (boss.kind === "ledger") {
    // No creature and no row either: a body over the middle of the field with
    // a cord out of its underside rooted in the hull, which is the only thing
    // in this game that touches both of them. It falls nothing — what it sends
    // down the cord is the pair's own shots (`ledger-step.ts`).
    world.boss = installLedger(world);
  } else if (boss.kind === "sinew") {
    // No creature and no row: a tendon above the grid with a mass on it that
    // the cannon cannot touch, and falls only what the pair's own snap-backs
    // shake out of it — until the last fibre drops the mass (`sinew-step.ts`).
    world.boss = installSinew(world);
  } else if (boss.kind === "surge") {
    // No creature and no row: a bulb over the middle columns the cannon cannot
    // touch, charged by thumbs and vented by their lifting (`surge-step.ts`).
    world.boss = installSurge(world);
  } else if (boss.kind === "lead") {
    // No creature and no row: a body pacing the top of the field, ahead of
    // which a shot is put; it drops only what its run drops (`lead-step.ts`).
    world.boss = installLead(world);
  } else if (boss.kind === "scuttle") {
    // No creature and no row: a frame of sockets over the top of the field,
    // and everything that falls in its wave is a part it threw (`scuttle-step.ts`).
    world.boss = installScuttle(world);
  } else if (boss.kind === "antiphon") {
    // No creature and no row: a body over the top of the field that grows
    // organs for one seat to describe and the other to name (`antiphon-step.ts`).
    world.boss = installAntiphon(world);
  } else if (boss.kind === "hive") {
    // No creature and no row: a body over the top of the field with breaches
    // along its underside, and everything that falls in its wave is a rock
    // one of them spilled (`hive-step.ts`).
    world.boss = installHive(world);
  } else if (boss.kind === "filament") {
    // No creature and no row: a body over the top of the field whose
    // filaments hang as lines of tiles for one thumb to draw and the other
    // to follow (`filament-step.ts`).
    world.boss = installFilament(world, boss.filaments);
  } else if (boss.kind === "gimbal") {
    // No creature and no row: a sealed drum hung in two nested rings above
    // the field, one ring to a seat, turned to the alignments its wave
    // authored (`gimbal-step.ts`).
    world.boss = installGimbal(world, boss.marks);
  } else if (boss.kind === "spool") {
    // No creature and no row: a thread-spool slung sideways across the top of
    // the field, its line already run out to the hull and taut, four ribs
    // whole, and every figure in it either tuning or rolled (`spool-step.ts`).
    world.boss = installSpool(world);
  } else if (boss.kind === "hasp") {
    // No creature and no row: three sealed clasps down the centre of the
    // field, a latch on each for one seat and a wheel behind it for the
    // other, and every figure in it tuning (`hasp-step.ts`).
    world.boss = installHasp(world);
  } else if (boss.kind === "ratchet") {
    // No creature and no row: a toothed rack down the centre of the field,
    // seven teeth, a catch for one seat and a pawl for the other, and every
    // figure in it tuning (`ratchet-step.ts`).
    world.boss = installRatchet(world);
  } else if (boss.kind === "nettle") {
    // THE INSTAR's engine with the ship's panel back: a jellyfish that is the
    // whole picture, and marks on it the cannon and the shield answer as well
    // as the thumbs (`nettle-words.ts`, `scene-panel.ts`).
    world.boss = installNettle(world, boss.steps);
  } else if (boss.kind === "mantle") {
    // No creature and no row: a hinged carapace shell over the field, two
    // handles at its valves, and four thresholds its wave authored for the
    // summed pull to cross (`mantle-step.ts`).
    world.boss = installMantle(world, boss.thresholds);
  } else if (boss.kind === "keel") {
    // No creature and no row: a six-segment spine arched along the top of
    // the field, every segment loose, and the socket's colour and the tempo
    // run's order its wave authored (`keel-step.ts`).
    world.boss = installKeel(world, boss.socket, boss.reprise);
  } else {
    // THE INSTAR, the last kind in the list and so the branch with no test on
    // it — the next boss goes in above it, with its `kind` on the list. No
    // creature, no row and no field: a body that is the whole panel, running
    // the script its wave authored, beat by beat (`instar-step.ts`).
    world.boss = installInstar(world, boss.steps);
  }
}
