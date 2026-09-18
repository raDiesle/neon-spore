import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimConfig, ticksPerBeat } from "../src/config.js";
import { type DiastoleState, diastoleChamberCol, diastoleContracts } from "../src/diastole.js";
import { diastoleClamped, diastoleCoincides, diastoleOpen } from "../src/diastole-open.js";
import { diastoleBoss, diastoleStruck } from "../src/diastole-step.js";
import { hashWorld } from "../src/hash.js";
import { step } from "../src/step.js";
import type { Bullet, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * **THE DIASTOLE's clamp**: the alone chamber's beat has to be held, not only
 * counted (`diastole-hand.ts`, `diastole-open.ts`).
 *
 * One receipt per rule of the hand. A thumb down on the contraction, or on
 * the beat before it, holds the chamber open for `diastoleClampBeats`; a
 * thumb down on any other beat, or held past its window, throws the chamber
 * into a spasm for `diastoleSpasmBeats` in which nothing lands; lifting the
 * thumb costs nothing; the beam that lands under a clamp lets it go; and the
 * hand is player 1's, in the alone phase, and no other's and in no other.
 * The end-to-end pass at the bottom is the one that goes through the beam's
 * own beat (`beamBeat`, `lance-burn.ts`), because that is the beat a clamp
 * the pilot sends *the beat before* has to be caught on.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const BRIDGE = midCol(CFG);
const LEFT = diastoleChamberCol(CFG, -1);
const RIGHT = diastoleChamberCol(CFG, 1);
const WAVE = 9;

function lobe(world: World): DiastoleState {
  const boss = diastoleBoss(world);
  if (boss === null) throw new Error("no twin lobe installed");
  return boss;
}

function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

function beam(world: World, col = BRIDGE): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color: "red",
    lance: true,
    driftMilli: 0,
    aimMilli: 0,
  };
}

/** A thumb on the chamber, whose it is and whether it is down, on this tick. */
function thumb(world: World, player: 1 | 2, on: boolean): void {
  const press: TimedCommand = {
    tick: world.tick,
    player,
    command: { kind: "drag", target: "diastoleChamber", on, fromMilli: 0 },
  };
  step(world, [press]);
}

/** Into `alone`: the left taken twice the ordinary way and once with the right, off the bridge. */
function alone(seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "diastole" });
  for (let i = 0; i < 2; i++) {
    while (!diastoleContracts(lobe(world), world.beat, -1)) beats(world, 1);
    diastoleStruck(world, { ...beam(world, LEFT), lance: false }, world.beat);
    beats(world, 1);
  }
  while (!diastoleCoincides(lobe(world), world.beat)) beats(world, 1);
  diastoleStruck(world, beam(world), world.beat);
  beats(world, 1);
  expect(lobe(world).phase).toBe("alone");
  return world;
}

/** Beats until the alone chamber is this many beats short of a contraction. */
function toBefore(world: World, short: number): void {
  while (!diastoleContracts(lobe(world), world.beat + short, 1)) beats(world, 1);
}

describe("the clamp", () => {
  it("holds the chamber open on the beat it was caught on, and the next", () => {
    const world = alone();
    toBefore(world, 0);
    const beat = world.beat;
    thumb(world, 1, true);
    const b = lobe(world);
    expect(b.clampBeat).toBe(beat);
    expect(b.clampUntil).toBe(beat + CFG.diastoleClampBeats);
    expect(diastoleOpen(b, beat, 1)).toBe(true);
    expect(diastoleOpen(b, beat + 1, 1)).toBe(true);
    expect(diastoleOpen(b, beat + 2, 1)).toBe(false);
    expect(world.events).toContainEqual({ type: "diastoleClamp", col: RIGHT, player: 1 });
  });

  it("catches a contraction from the beat before it", () => {
    const world = alone();
    toBefore(world, 1);
    thumb(world, 1, true);
    const b = lobe(world);
    expect(b.phase).toBe("alone");
    expect(b.clampBeat).toBe(world.beat + 1);
    expect(diastoleOpen(b, world.beat, 1)).toBe(false);
    expect(diastoleOpen(b, world.beat + 1, 1)).toBe(true);
  });

  it("is open on no beat at all with no thumb on it, however well the count was kept", () => {
    const world = alone();
    const b = lobe(world);
    for (let beat = 0; beat < 21; beat++) {
      expect(diastoleOpen(b, b.phaseBeat + beat, 1)).toBe(false);
      expect(diastoleCoincides(b, b.phaseBeat + beat)).toBe(false);
    }
    toBefore(world, 0);
    diastoleStruck(world, beam(world), world.beat);
    expect(b.rightHits).toBe(CFG.diastoleChamberHits - 1);
  });

  it("spasms on a thumb that comes down on any other beat, and nothing lands in it", () => {
    const world = alone();
    toBefore(world, 2);
    thumb(world, 1, true);
    const b = lobe(world);
    expect(b.phase).toBe("spasm");
    expect(diastoleClamped(b)).toBe(false);
    expect(world.events).toContainEqual({ type: "diastoleSpasm", col: RIGHT });
    beats(world, 2);
    diastoleStruck(world, beam(world), world.beat);
    expect(b.rightHits).toBe(CFG.diastoleChamberHits - 1);
  });

  it("spasms when the thumb is held past its window", () => {
    const world = alone();
    toBefore(world, 0);
    thumb(world, 1, true);
    const b = lobe(world);
    beats(world, CFG.diastoleClampBeats - 1);
    expect(b.phase).toBe("alone");
    beats(world, 1);
    expect(b.phase).toBe("spasm");
    expect(b.phaseBeat).toBe(world.beat);
  });

  it("beats again from where it stopped, after the spasm has run", () => {
    const world = alone();
    toBefore(world, 2);
    thumb(world, 1, true);
    const b = lobe(world);
    const stopped = world.beat;
    beats(world, CFG.diastoleSpasmBeats - 1);
    expect(b.phase).toBe("spasm");
    beats(world, 1);
    expect(b.phase).toBe("alone");
    expect(b.phaseBeat).toBe(stopped + CFG.diastoleSpasmBeats);
    expect(diastoleContracts(b, world.beat, 1)).toBe(true);
    // And the count is honest: a clamp is answered from the new origin.
    thumb(world, 1, true);
    expect(b.phase).toBe("alone");
    expect(b.clampBeat).toBe(world.beat);
  });

  it("costs nothing to lift, and a second clamp is heard after it", () => {
    const world = alone();
    toBefore(world, 0);
    thumb(world, 1, true);
    thumb(world, 1, false);
    const b = lobe(world);
    expect(diastoleClamped(b)).toBe(false);
    beats(world, CFG.diastoleClampBeats + 1);
    expect(b.phase).toBe("alone");
    toBefore(world, 0);
    thumb(world, 1, true);
    expect(b.clampBeat).toBe(world.beat);
  });

  it("is let go by the beam that lands under it", () => {
    const world = alone();
    toBefore(world, 0);
    thumb(world, 1, true);
    const b = lobe(world);
    diastoleStruck(world, beam(world), world.beat);
    expect(b.rightHits).toBe(CFG.diastoleChamberHits - 2);
    expect(diastoleClamped(b)).toBe(false);
    beats(world, CFG.diastoleClampBeats + 1);
    expect(b.phase).toBe("alone");
  });

  it("is player 1's thumb, in the alone phase, and no other's", () => {
    const world = alone();
    toBefore(world, 0);
    thumb(world, 2, true);
    expect(diastoleClamped(lobe(world))).toBe(false);
    expect(lobe(world).phase).toBe("alone");
    const two = createWorld(CFG, 5);
    startWave(two, WAVE, [], [], { kind: "diastole" });
    const before = hashWorld(two);
    thumb(two, 1, true);
    expect(lobe(two).phase).toBe("one");
    expect(diastoleClamped(lobe(two))).toBe(false);
    expect(hashWorld(two)).not.toBe(before); // the tick moved; the boss did not
  });

  it("puts the clamp in the fingerprint", () => {
    const world = alone();
    const before = hashWorld(world);
    const b = lobe(world);
    b.clampBeat = world.beat;
    b.clampUntil = world.beat + CFG.diastoleClampBeats;
    expect(hashWorld(world)).not.toBe(before);
  });
});

describe("the lance under the clamp, all the way through", () => {
  it("takes the alone chamber when the fill comes full under a clamp sent the beat before", () => {
    const world = alone();
    let target = world.beat;
    while (
      !diastoleContracts(lobe(world), target, 1) ||
      target - world.beat < CFG.lancePrimeBeats + 1
    ) {
      target += 1;
    }
    beats(world, target - world.beat - CFG.lancePrimeBeats);
    world.cannonCol = BRIDGE;
    const prime: TimedCommand = {
      tick: world.tick,
      player: 2,
      command: { kind: "prime", on: true, color: "red" },
    };
    step(world, [prime]);
    let sent = false;
    for (let i = 0; i < CFG.lancePrimeBeats * TPB; i++) {
      if (!sent && world.beat === target - 1) {
        thumb(world, 1, true);
        sent = true;
      } else step(world, []);
    }
    expect(world.beam?.col).toBe(BRIDGE);
    const b = lobe(world);
    expect(b.struckBeat).toBe(target);
    expect(b.rightHits).toBe(CFG.diastoleChamberHits - 2);
    expect(diastoleClamped(b)).toBe(false);
  });
});
