import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimConfig, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { step } from "../src/step.js";
import {
  type ThroatPhase,
  type ThroatState,
  throatBoss,
  throatMouthCol,
  throatMouthRow,
} from "../src/throat.js";
import { throatInhales, throatToInhale } from "../src/throat-clock.js";
import { throatCinchable, throatCinched, throatHauling } from "../src/throat-hand.js";
import type { Command, Creature, CreatureKind, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * **THE THROAT's two hands on its own picture** — the navigator's cinch on a
 * slack ring and the pilot's haul on the tube (`docs/spec/bosses.md` §11.19,
 * *Five states, and the gullet hands out a control as it loses one*).
 *
 * What is held here is the bargain, because the bargain is the whole of both
 * gestures. Neither can hurt the pair and neither can be spammed: the cinch
 * stops the gullet breathing and is paid for beat by beat afterwards, so the
 * freeze is borrowed and never given; the haul moves the mouth once per carry
 * and only in the phase where the mouth has stopped coming to them.
 *
 * And the grid stays the grid. Player 2's readout is `throatToInhale` and it
 * is a pure function of the phase — her own thumb must not make the number she
 * is saying out loud flinch, which is why the debt is a second field and not a
 * shifted origin (`throat-clock.ts`).
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HOME = midCol(CFG);
const ROW = throatMouthRow(CFG);
const WAVE = 9;

/** The fight, put straight into the state a test wants to watch. Phases are a
 * stored field and `advance` only ever moves forward, so a phase set to the
 * one its own ring count earns stays where it is put. */
function open(phase: ThroatPhase, slack: number): World {
  const world = createWorld(CFG, 3);
  startWave(world, WAVE, [], [], { kind: "throat" });
  const b = tube(world);
  b.slack = slack;
  b.phase = phase;
  b.phaseBeat = world.beat;
  return world;
}

function tube(world: World): ThroatState {
  const boss = throatBoss(world);
  if (boss === null) throw new Error("no gullet installed");
  return boss;
}

/** A body put where a test wants it, which is what a wave's own author does. */
function put(world: World, kind: CreatureKind, col: number, row: number): Creature {
  const c: Creature = {
    id: world.nextId++,
    kind,
    col,
    row,
    fromRow: row,
    fromCol: col,
    color: kind === "gum" || kind === "meteor" ? null : "red",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: 0,
  };
  world.creatures.push(c);
  return c;
}

/** Beats, with a thumb saying the same thing on every tick of them — which is
 * what a thumb that is down actually sends (`stareLidHeard`). */
function beats(world: World, n: number, held: Command | null = null, player: 1 | 2 = 2): void {
  for (let i = 0; i < n * TPB; i++) {
    const cmds: TimedCommand[] = held === null ? [] : [{ tick: world.tick, player, command: held }];
    step(world, cmds);
  }
}

/** One tick, with one thing said on it. */
function once(world: World, player: 1 | 2, command: Command): void {
  step(world, [{ tick: world.tick, player, command }]);
}

const ring = (on: boolean): Command => ({ kind: "drag", target: "throatRing", on, fromMilli: 0 });

const carry = (milli: number, on = false): Command => ({
  kind: "drag",
  target: "throatTube",
  on,
  fromMilli: milli,
});

describe("the navigator's cinch", () => {
  it("stops the gullet breathing, so what is standing in the mouth lives", () => {
    const world = open("open", CFG.throatRings - 1);
    const b = tube(world);
    put(world, "slick", HOME, ROW);
    // `open` inhales every beat, so an uncinched gullet takes this body on the
    // first of them and re-tightens a ring off it (`throatFed`).
    beats(world, 2, ring(true));
    expect(throatCinched(b)).toBe(true);
    expect(world.creatures).toHaveLength(1);
    expect(b.slack).toBe(CFG.throatRings - 1);
    expect(b.fedBeat).toBe(-1);
    expect(b.breath).toBe(2);
  });

  it("tears the ring out at throatCinchBeats, and the bill arrives anyway", () => {
    const world = open("open", CFG.throatRings - 1);
    const b = tube(world);
    put(world, "slick", HOME, ROW);
    beats(world, CFG.throatCinchBeats, ring(true));
    // Her thumb has not moved and the ring is gone out of it: the cap is a
    // length rather than a strength, and it is a number she can count.
    expect(throatCinched(b)).toBe(false);
    expect(b.breath).toBe(CFG.throatCinchBeats);
    expect(world.creatures).toHaveLength(1);
    // And the very next beat is one of the borrowed ones, given back.
    beats(world, 1, ring(true));
    expect(world.creatures).toHaveLength(0);
    expect(b.slack).toBe(CFG.throatRings - 2);
  });

  it("cannot be taken again until the debt is paid, however long the thumb stays down", () => {
    const world = open("open", CFG.throatRings - 1);
    const b = tube(world);
    beats(world, CFG.throatCinchBeats, ring(true));
    expect(b.breath).toBe(CFG.throatCinchBeats);
    // The same thumb, saying the same thing, on every tick of the repayment:
    // a ring that could be re-taken here would be a freeze with no price.
    for (let paid = 1; paid <= CFG.throatCinchBeats; paid++) {
      beats(world, 1, ring(true));
      expect(throatCinched(b)).toBe(false);
      expect(b.breath).toBe(CFG.throatCinchBeats - paid);
    }
    // Paid off, and now it is hers again.
    expect(throatCinchable(b)).toBe(true);
    beats(world, 1, ring(true));
    expect(throatCinched(b)).toBe(true);
  });

  it("gives the stolen inhale back on a beat the grid would not have breathed on", () => {
    const world = open("slide", 1);
    const b = tube(world);
    // A whole cadence with her thumb down: exactly one grid inhale falls
    // inside it, so one is owed and the cap is nowhere near.
    beats(world, CFG.throatInhaleBeats, ring(true));
    expect(b.breath).toBe(1);
    once(world, 2, ring(false));
    expect(throatCinched(b)).toBe(false);
    beats(world, 1);
    // The debt came off, and the beat it came off on is not one the cadence
    // would have inhaled on: `breath` only ever falls on a beat the gullet
    // actually breathes, so this is the *later and faster* the bargain buys.
    expect(b.breath).toBe(0);
    expect(throatInhales(CFG, b, world.beat)).toBe(false);
  });

  it("leaves the readout alone: the countdown she says out loud never flinches", () => {
    const world = open("slide", 1);
    const b = tube(world);
    const said: number[] = [];
    for (let i = 0; i < CFG.throatInhaleBeats; i++) {
      said.push(throatToInhale(CFG, b, world.beat));
      beats(world, 1, ring(true));
    }
    // Every number in the cadence, once, while her thumb is on the ring: the
    // grid is a pure function of the phase and her hand is not in it.
    expect(new Set(said).size).toBe(CFG.throatInhaleBeats);
    expect(said).toContain(0);
  });

  it("is not there until a ring is slack, nor while the tube is turning inside out", () => {
    const whole = open("still", 0);
    expect(throatCinchable(tube(whole))).toBe(false);
    once(whole, 2, ring(true));
    expect(throatCinched(tube(whole))).toBe(false);
    const done = open("everts", CFG.throatRings);
    expect(throatCinchable(tube(done))).toBe(false);
    once(done, 2, ring(true));
    expect(throatCinched(tube(done))).toBe(false);
  });

  it("is hers and not his", () => {
    const world = open("open", CFG.throatRings - 1);
    once(world, 1, ring(true));
    expect(throatCinched(tube(world))).toBe(false);
  });
});

describe("the pilot's haul", () => {
  it("drags the mouth a column the way his thumb went, on the next beat", () => {
    const world = open("open", CFG.throatRings - 1);
    const b = tube(world);
    once(world, 1, carry(CFG.throatHaulMilli));
    expect(throatHauling(b)).toBe(true);
    beats(world, 1);
    expect(throatMouthCol(CFG, b, world.beat)).toBe(HOME + 1);
    // Spent, whatever the phase: a pending number that outlived its beat is a
    // number two devices could spend on different ones.
    expect(throatHauling(b)).toBe(false);
    once(world, 1, carry(-CFG.throatHaulMilli));
    beats(world, 1);
    expect(throatMouthCol(CFG, b, world.beat)).toBe(HOME);
  });

  it("takes a body back out of the mouth, which nothing else in this fight does", () => {
    const world = open("open", CFG.throatRings - 1);
    const b = tube(world);
    put(world, "slick", HOME, ROW);
    once(world, 1, carry(CFG.throatHaulMilli));
    beats(world, 1);
    // The haul is taken before the breath, so the inhale that would have
    // swallowed this body arrives over an empty column instead.
    expect(world.creatures).toHaveLength(1);
    expect(b.slack).toBe(CFG.throatRings - 1);
  });

  it("is a carry and not a press, and not a carry that never travelled", () => {
    const world = open("open", CFG.throatRings - 1);
    const b = tube(world);
    once(world, 1, carry(CFG.throatHaulMilli, true));
    expect(throatHauling(b)).toBe(false);
    once(world, 1, carry(CFG.throatHaulMilli - 1));
    expect(throatHauling(b)).toBe(false);
    beats(world, 1);
    expect(throatMouthCol(CFG, b, world.beat)).toBe(HOME);
  });

  it("is his, and only in the phase where the mouth has stopped coming to them", () => {
    const world = open("open", CFG.throatRings - 1);
    once(world, 2, carry(CFG.throatHaulMilli));
    expect(throatHauling(tube(world))).toBe(false);
    const quick = open("quick", 2);
    const b = quick.boss as ThroatState;
    const was = throatMouthCol(CFG, b, quick.beat + 1);
    once(quick, 1, carry(CFG.throatHaulMilli));
    expect(throatHauling(b)).toBe(false);
    beats(quick, 1);
    expect(throatMouthCol(CFG, b, quick.beat)).toBe(was);
  });
});

/** Every event the gullet said across these beats, in order. `step` clears
 * `world.events` at the top of every tick, so a run of beats has to be
 * collected as it goes. */
function said(world: World, n: number, held: Command | null = null, player: 1 | 2 = 2): string[] {
  const seen: string[] = [];
  for (let i = 0; i < n * TPB; i++) {
    const cmds: TimedCommand[] = held === null ? [] : [{ tick: world.tick, player, command: held }];
    step(world, cmds);
    for (const e of world.events) if (e.type.startsWith("throat")) seen.push(e.type);
  }
  return seen;
}

describe("what the gullet says out loud", () => {
  it("says the cinch once however long the thumb stays down", () => {
    const world = open("open", CFG.throatRings - 1);
    // One landing and one tear across a whole cap: a thumb that is down sends
    // `on: true` on every tick of it, and a cinch said per tick would be the
    // loudest sound in the game for a gesture that happened once.
    expect(said(world, CFG.throatCinchBeats, ring(true))).toEqual(["throatCinch", "throatSlip"]);
  });

  it("says the same slip whether the thumb lifted or the cap took it", () => {
    const lifted = open("open", CFG.throatRings - 1);
    said(lifted, 1, ring(true));
    expect(said(lifted, 1, ring(false))).toEqual(["throatSlip"]);
    // A lift and a tear cost the pair the same thing, so they are one line
    // (`throatRelease`) — and the pair has to be able to act on the sound
    // without being told which of the two it was.
    const torn = open("open", CFG.throatRings - 1);
    expect(said(torn, CFG.throatCinchBeats, ring(true)).at(-1)).toBe("throatSlip");
  });

  it("is silent on a lift that let go of nothing", () => {
    const world = open("still", 0);
    // Nothing is choked yet, so her thumb landed on no ring at all. A slip
    // here would be a window shutting that never opened.
    expect(said(world, 2, ring(false))).toEqual([]);
    expect(said(world, 2, ring(true))).toEqual([]);
  });

  it("says the haul on the beat it lands, in the column it landed on", () => {
    const world = open("open", CFG.throatRings - 1);
    const b = tube(world);
    once(world, 1, carry(CFG.throatHaulMilli));
    // Nothing on the tick the carry was heard: the mouth has not moved yet
    // and the column in the event is the one `throatSnap` settled on.
    expect(world.events.filter((e) => e.type === "throatHaul")).toHaveLength(0);
    const heard = said(world, 1);
    expect(heard).toEqual(["throatHaul"]);
    expect(b.mouthFrom).toBe(HOME + 1);
  });

  it("says nothing for a haul the phase refused", () => {
    const world = open("quick", 2);
    once(world, 1, carry(CFG.throatHaulMilli));
    expect(said(world, 2)).toEqual([]);
  });
});

describe("both hands on the wire", () => {
  it("are in the fingerprint, so two devices cannot spend them differently", () => {
    const held = open("open", CFG.throatRings - 1);
    const free = open("open", CFG.throatRings - 1);
    expect(hashWorld(held)).toBe(hashWorld(free));
    once(held, 2, ring(true));
    expect(hashWorld(held)).not.toBe(hashWorld(free));
    once(free, 1, carry(CFG.throatHaulMilli));
    expect(hashWorld(free)).not.toBe(hashWorld(open("open", CFG.throatRings - 1)));
  });
});
