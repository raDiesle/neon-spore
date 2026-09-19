import { describe, expect, it } from "bun:test";
import {
  type AntiphonCandidate,
  type AntiphonState,
  antiphonBoss,
  antiphonCrossed,
  antiphonGrown,
  antiphonIsOrgan,
} from "../src/antiphon.js";
import { antiphonStruck } from "../src/antiphon-shot.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * **THE ANTIPHON's second gesture: the navigator pulls a candidate off her
 * rail** (`antiphon-hand.ts`). The rule is one sentence — *pull off the ones
 * you know are wrong* — and what is pinned here is that sentence taken apart:
 * that a crossing costs a candidate its place in the cycle, that it is hers
 * and nobody else's, that a carry too short and a rail pulled at before the
 * organ stands are both refused, that a crossed candidate can neither harden
 * the cycle nor spill on them, that pulling off the one he is describing
 * hardens the cycle exactly as firing at a decoy does, and that all of it is
 * in the fingerprint.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "antiphon" });
  return world;
}

function body(world: World): AntiphonState {
  const s = antiphonBoss(world);
  if (s === null) throw new Error("no body installed");
  return s;
}

/** Run until the standing organ has grown all the way out. */
function grown(world: World): AntiphonState {
  const s = body(world);
  for (let n = 0; n < 40 * TPB; n++) {
    const o = s.organs[0];
    if (o !== undefined && antiphonGrown(o, CFG, world.beat)) return s;
    step(world, []);
  }
  throw new Error("nothing grew");
}

/** A thumb on or off the candidate at place `id`, carried `milli` of a tile down. */
function thumb(world: World, id: number, on: boolean, milli: number, player: 1 | 2) {
  const cmd: TimedCommand = {
    tick: world.tick,
    player,
    command: { kind: "drag", target: "antiphonRail", on, fromMilli: 0, fromYMilli: milli, id },
  };
  step(world, [cmd]);
}

/** Her thumb carried `milli` down off the candidate at place `id`. */
const pull = (world: World, id: number, milli = CFG.antiphonPullMilli, player: 1 | 2 = 2) =>
  thumb(world, id, true, milli, player);

/** Her thumb lifted off it. */
const lift = (world: World, id: number) => thumb(world, id, false, 0, 2);

/** The place on the rail of the first candidate that is, or is not, the organ. */
function place(s: AntiphonState, isOrgan: boolean): number {
  const i = s.rail.findIndex((c) => antiphonIsOrgan(s, c) === isOrgan);
  if (i < 0) throw new Error("no such candidate on the rail");
  return i;
}

const decoy = (s: AntiphonState) => place(s, false);
const organ = (s: AntiphonState) => place(s, true);

function at(s: AntiphonState, i: number): AntiphonCandidate {
  const c = s.rail[i];
  if (c === undefined) throw new Error("nothing at that place");
  return c;
}

/** A shot that has just left through the top of `col`, the way `bullets.ts` hands one over. */
function shot(world: World, col: number, color: Color): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color,
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

describe("a candidate pulled off the rail", () => {
  it("crosses it off, and says how many candidates are left", () => {
    const world = open();
    const s = grown(world);
    const i = decoy(s);
    pull(world, i);
    expect(antiphonCrossed(s, i)).toBe(true);
    const e = world.events.find((x) => x.type === "antiphonPull");
    expect(e).toEqual({ type: "antiphonPull", col: at(s, i).col, left: s.rail.length - 1 });
  });

  it("is hers: the pilot's thumb on the rail is dropped without a sound", () => {
    const world = open();
    const s = grown(world);
    const i = decoy(s);
    pull(world, i, CFG.antiphonPullMilli, 1);
    expect(antiphonCrossed(s, i)).toBe(false);
    expect(s.heldRail).toBe(-1);
    expect(world.events.some((x) => x.type === "antiphonPull")).toBe(false);
  });

  it("is held while her thumb is on it, and let go when it lifts", () => {
    const world = open();
    const s = grown(world);
    const i = decoy(s);
    pull(world, i, 0);
    expect(s.heldRail).toBe(i);
    expect(antiphonCrossed(s, i)).toBe(false);
    lift(world, i);
    expect(s.heldRail).toBe(-1);
  });

  it("refuses a carry shorter than antiphonPullMilli", () => {
    const world = open();
    const s = grown(world);
    const i = decoy(s);
    pull(world, i, CFG.antiphonPullMilli - 1);
    expect(antiphonCrossed(s, i)).toBe(false);
    pull(world, i);
    expect(antiphonCrossed(s, i)).toBe(true);
  });

  it("refuses everything before the organ has pushed all the way out", () => {
    const world = open();
    const s = body(world);
    for (let n = 0; n < 40 * TPB && s.rail.length === 0; n++) step(world, []);
    expect(s.rail.length).toBeGreaterThan(0);
    const i = decoy(s);
    pull(world, i);
    expect(antiphonCrossed(s, i)).toBe(false);
    // Her thumb is still on it: a hand held ready over a rail still growing
    // is the picture, and the ring fills under it.
    expect(s.heldRail).toBe(i);
  });

  it("crosses a candidate off once: a second pull on it says nothing", () => {
    const world = open();
    const s = grown(world);
    const i = decoy(s);
    pull(world, i);
    pull(world, i);
    expect(s.crossed).toEqual([i]);
    expect(world.events.filter((x) => x.type === "antiphonPull")).toHaveLength(0);
  });

  it("takes a column out of the cycle: a bolt into it is nothing", () => {
    const world = open();
    const s = grown(world);
    const i = decoy(s);
    const c = at(s, i);
    pull(world, i);
    antiphonStruck(world, shot(world, c.col, c.color));
    expect(s.extra).toBe(0);
    expect(s.organs).not.toEqual([]);
    expect(world.events.some((x) => x.type === "antiphonHarden")).toBe(false);
  });

  it("keeps it from falling on them when a pit ends the cycle", () => {
    const world = open();
    const s = grown(world);
    s.pits = Array.from({ length: CFG.antiphonSpillPits - 1 }, (_, n) => 90 + n);
    const i = decoy(s);
    const c = at(s, i);
    pull(world, i);
    const o = s.organs[0];
    if (o === undefined) throw new Error("no organ");
    antiphonStruck(world, shot(world, o.col, o.color));
    const spills = world.events.filter((x) => x.type === "antiphonSpill");
    expect(spills.length).toBeGreaterThan(0);
    expect(spills.some((x) => x.col === c.col)).toBe(false);
  });

  it("hardens the cycle when the one he is describing is pulled off", () => {
    const world = open();
    const s = grown(world);
    pull(world, organ(s));
    expect(s.extra).toBe(1);
    expect(s.organs).toEqual([]);
    expect(world.events.some((x) => x.type === "antiphonHarden")).toBe(true);
    expect(world.events.some((x) => x.type === "antiphonPull")).toBe(false);
  });

  it("is given back at the next cycle: a new rail is crossed off nothing", () => {
    const world = open();
    const s = grown(world);
    pull(world, decoy(s));
    expect(s.crossed).not.toEqual([]);
    const o = s.organs[0];
    if (o === undefined) throw new Error("no organ");
    antiphonStruck(world, shot(world, o.col, o.color));
    expect(s.crossed).toEqual([]);
    expect(s.heldRail).toBe(-1);
  });

  it("is in the fingerprint", () => {
    const a = open(11);
    const b = open(11);
    const sa = grown(a);
    grown(b);
    expect(hashWorld(a)).toBe(hashWorld(b));
    pull(a, decoy(sa));
    step(b, []);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
    // And a thumb resting on a candidate with nothing crossed off yet is a
    // fact of its own, as the turn's is.
    const c = open(11);
    const d = open(11);
    const sc = grown(c);
    grown(d);
    pull(c, decoy(sc), 0);
    step(d, []);
    expect(hashWorld(c)).not.toBe(hashWorld(d));
  });
});
