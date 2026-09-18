import { describe, expect, it } from "bun:test";
import {
  ANTIPHON_SHIP,
  type AntiphonOrgan,
  type AntiphonState,
  antiphonBoss,
  antiphonFamilyOf,
  antiphonGrown,
  antiphonIsOrgan,
  antiphonRailSize,
  antiphonSinkBeat,
} from "../src/antiphon.js";
import { antiphonStruck } from "../src/antiphon-shot.js";
import { bossFillsWave, bossHoldsWave } from "../src/boss-kinds.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  livingKindForColor,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";
import { failHolds } from "../src/wave-fail.js";

/**
 * THE ANTIPHON: the boss that is a question about describing a thing with
 * no name.
 *
 * What these pin is the clock and the judgment. That the body rises smooth
 * with nothing on the field; that after `antiphonRestBeats` an organ grows
 * on a rail of `antiphonRail` candidates with distinct columns and distinct
 * shapes, the organ among them; that nothing counts until it has grown for
 * `antiphonGrowBeats`; that the organ's colour in the organ's column takes
 * it to a pit and ends the cycle, the other colour there is nothing, a
 * decoy's colour in the decoy's column hardens the cycle and widens every
 * rail after by one, and a column that names nothing is nothing; that the
 * window runs out after `antiphonWindowBeats` and the organ sinks, firing a
 * body down its column from `antiphonFirePits`; that a pit from
 * `antiphonSpillPits` drops every rejected candidate as a body; that the rail
 * closes on the organ's family from `antiphonTightPits` with the window
 * tightened, two grow from `antiphonTwinPits`, and a pit is grown again from
 * `antiphonEchoPits`; that with every pit taken the surface goes still, the
 * ship grows on a rail of ships, the right one bursts it and the wrong one
 * hardens it; and that the body is out after `antiphonOutBeats`.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
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

/** Run `n` beats, and say which of the boss's events went by. */
function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** A shot that has just left through the top of `col`, the way `bullets.ts` hands one over. */
function shot(world: World, col: number, color: Color = "red", lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

/** Run until an organ stands, and say how many beats it took. */
function untilStanding(world: World): number {
  const s = body(world);
  for (let n = 0; n < 40; n++) {
    if (s.organs.length > 0) return n;
    beats(world, 1);
  }
  throw new Error("nothing grew");
}

/** Run until the standing organ has grown all the way out. */
function untilGrown(world: World): AntiphonOrgan {
  const s = body(world);
  untilStanding(world);
  for (let n = 0; n < 40; n++) {
    const o = s.organs[0];
    if (o !== undefined && antiphonGrown(o, CFG, world.beat)) return o;
    beats(world, 1);
  }
  throw new Error("nothing grown");
}

/** The fight further along without playing it: `pits` taken, then the next organ grown. */
function stand(world: World, pits: number[]): AntiphonOrgan {
  body(world).pits = pits.slice();
  return untilGrown(world);
}

/** The rail's candidates that are not organs. */
function decoys(s: AntiphonState) {
  return s.rail.filter((c) => !antiphonIsOrgan(s, c));
}

describe("the body rising", () => {
  it("rises smooth, with nothing on the rail and nothing on the field", () => {
    const world = open();
    const s = body(world);
    expect(s.organs).toEqual([]);
    expect(s.rail).toEqual([]);
    expect(s.pits).toEqual([]);
    expect(s.extra).toBe(0);
    expect(world.creatures).toHaveLength(0);
    expect(world.events.some((e) => e.type === "antiphonEnter")).toBe(true);
  });

  it("is a fixture that holds its wave and fills it", () => {
    expect(bossHoldsWave("antiphon")).toBe(true);
    expect(bossFillsWave("antiphon")).toBe(true);
  });

  it("rests, then grows one organ on a rail of distinct columns and shapes", () => {
    const world = open();
    const rested = untilStanding(world);
    expect(rested).toBeGreaterThanOrEqual(CFG.antiphonRestBeats);
    expect(rested).toBeLessThanOrEqual(CFG.antiphonRestBeats + 1);
    const s = body(world);
    expect(s.organs).toHaveLength(1);
    expect(s.rail).toHaveLength(CFG.antiphonRail);
    expect(new Set(s.rail.map((c) => c.col)).size).toBe(s.rail.length);
    expect(new Set(s.rail.map((c) => c.shape)).size).toBe(s.rail.length);
    expect(s.rail.filter((c) => antiphonIsOrgan(s, c))).toHaveLength(1);
    expect(world.events.some((e) => e.type === "antiphonGrow")).toBe(true);
  });
});

describe("the judgment", () => {
  it("counts nothing while the organ is still pushing out", () => {
    const world = open();
    untilStanding(world);
    const s = body(world);
    const o = s.organs[0];
    if (o === undefined) throw new Error("no organ");
    expect(antiphonGrown(o, CFG, world.beat)).toBe(false);
    antiphonStruck(world, shot(world, o.col, o.color));
    expect(s.organs).toHaveLength(1);
    expect(s.pits).toEqual([]);
  });

  it("takes the organ's colour in the organ's column to a pit and ends the cycle, nothing falling", () => {
    const world = open();
    const o = untilGrown(world);
    const s = body(world);
    antiphonStruck(world, shot(world, o.col, o.color));
    expect(s.pits).toEqual([o.shape]);
    expect(s.organs).toEqual([]);
    expect(s.rail).toEqual([]);
    expect(s.cycleBeat).toBe(world.beat);
    expect(world.creatures).toHaveLength(0);
    expect(world.events.some((e) => e.type === "antiphonPit")).toBe(true);
  });

  it("says nothing to the other colour in the organ's column", () => {
    const world = open();
    const o = untilGrown(world);
    const s = body(world);
    world.events.length = 0;
    antiphonStruck(world, shot(world, o.col, o.color === "red" ? "cyan" : "red"));
    expect(s.organs).toHaveLength(1);
    expect(s.pits).toEqual([]);
    expect(world.events).toHaveLength(0);
  });

  it("hardens on a decoy's colour in the decoy's column, and the next rail is one wider", () => {
    const world = open();
    untilGrown(world);
    const s = body(world);
    const d = decoys(s)[0];
    if (d === undefined) throw new Error("no decoy");
    antiphonStruck(world, shot(world, d.col, d.color));
    expect(s.extra).toBe(1);
    expect(s.organs).toEqual([]);
    expect(s.pits).toEqual([]);
    expect(world.events.some((e) => e.type === "antiphonHarden")).toBe(true);
    untilStanding(world);
    expect(s.rail).toHaveLength(CFG.antiphonRail + 1);
  });

  it("caps what hardening adds at the rail's widest", () => {
    const world = open();
    const s = body(world);
    s.extra = 20;
    expect(antiphonRailSize(s, CFG, 1)).toBe(CFG.antiphonRailMax);
  });

  it("is nothing for a column that names no candidate, and nothing for a beam", () => {
    const world = open();
    const o = untilGrown(world);
    const s = body(world);
    const free = [...Array(CFG.cols).keys()].find((c) => !s.rail.some((r) => r.col === c));
    if (free === undefined) throw new Error("no free column");
    world.events.length = 0;
    antiphonStruck(world, shot(world, free, o.color));
    antiphonStruck(world, shot(world, o.col, o.color, true));
    expect(s.organs).toHaveLength(1);
    expect(s.extra).toBe(0);
    expect(world.events).toHaveLength(0);
  });
});

describe("the window", () => {
  it("runs out after antiphonWindowBeats and the organ sinks back, nothing falling in the first phase", () => {
    const world = open();
    const o = untilGrown(world);
    const s = body(world);
    expect(antiphonSinkBeat(s, CFG)).toBe(
      o.grownBeat + CFG.antiphonGrowBeats + CFG.antiphonWindowBeats,
    );
    const seen = beats(world, CFG.antiphonWindowBeats + 1);
    expect(seen.has("antiphonSink")).toBe(true);
    expect(s.organs).toEqual([]);
    expect(world.creatures).toHaveLength(0);
  });

  it("fires a body in the organ's colour down its column from antiphonFirePits", () => {
    const world = open();
    const o = stand(world, [...Array(CFG.antiphonFirePits).keys()]);
    const seen = beats(world, CFG.antiphonTightWindowBeats + 1);
    const fired = world.creatures.filter((c) => c.col === o.col);
    expect(fired).toHaveLength(1);
    expect(fired[0]?.color).toBe(o.color);
    expect(fired[0]?.kind).toBe(livingKindForColor(o.color));
    expect(seen.has("antiphonSink")).toBe(true);
  });

  it("tightens from antiphonTightPits, and the rail closes on the organ's family", () => {
    const world = open();
    const o = stand(world, [...Array(CFG.antiphonTightPits).keys()]);
    const s = body(world);
    expect(antiphonSinkBeat(s, CFG)).toBe(
      o.grownBeat + CFG.antiphonGrowBeats + CFG.antiphonTightWindowBeats,
    );
    for (const d of decoys(s)) {
      expect(antiphonFamilyOf(CFG, d.shape)).toBe(antiphonFamilyOf(CFG, o.shape));
      expect(d.shape).not.toBe(o.shape);
    }
  });
});

describe("the cost of a wrong answer", () => {
  it("drops every rejected candidate as a body in its colour from antiphonSpillPits", () => {
    const world = open();
    const o = stand(world, [...Array(CFG.antiphonSpillPits - 1).keys()]);
    const s = body(world);
    const rejected = decoys(s);
    antiphonStruck(world, shot(world, o.col, o.color));
    expect(world.creatures).toHaveLength(rejected.length);
    for (const c of rejected) {
      const fell = world.creatures.find((x) => x.col === c.col);
      expect(fell?.color).toBe(c.color);
    }
    expect(world.events.filter((e) => e.type === "antiphonSpill")).toHaveLength(rejected.length);
  });
});

describe("the second phase", () => {
  it("grows two from antiphonTwinPits on a rail two wider, and the cycle ends with the second", () => {
    const world = open();
    stand(world, [...Array(CFG.antiphonTwinPits).keys()]);
    const s = body(world);
    expect(s.organs).toHaveLength(2);
    expect(s.rail).toHaveLength(CFG.antiphonRail + 2);
    const [a, b] = s.organs;
    if (a === undefined || b === undefined) throw new Error("no twins");
    antiphonStruck(world, shot(world, a.col, a.color));
    expect(s.organs).toHaveLength(1);
    expect(s.rail).not.toEqual([]);
    antiphonStruck(world, shot(world, b.col, b.color));
    expect(s.organs).toEqual([]);
    expect(s.rail).toEqual([]);
    expect(s.pits).toHaveLength(CFG.antiphonTwinPits + 2);
  });

  it("spills the decoys when the second twin pits, and never the twin already taken", () => {
    const world = open();
    stand(world, [...Array(CFG.antiphonTwinPits).keys()]);
    const s = body(world);
    const rejected = decoys(s);
    const [a, b] = s.organs;
    if (a === undefined || b === undefined) throw new Error("no twins");
    antiphonStruck(world, shot(world, a.col, a.color));
    expect(world.creatures).toEqual([]);
    antiphonStruck(world, shot(world, b.col, b.color));
    expect(world.creatures).toHaveLength(rejected.length);
    expect(world.creatures.find((c) => c.col === a.col)).toBeUndefined();
  });

  it("grows a pit again from antiphonEchoPits", () => {
    const world = open();
    const pits = [...Array(CFG.antiphonEchoPits).keys()];
    const o = stand(world, pits);
    expect(pits).toContain(o.shape);
  });
});

describe("the ship", () => {
  it("goes still with every pit taken, grows the ship on a rail of ships, and the right one bursts it", () => {
    const world = open();
    body(world).pits = [...Array(CFG.antiphonPits).keys()];
    const seen = beats(world, CFG.antiphonRestBeats + 1);
    expect(seen.has("antiphonStill")).toBe(true);
    const s = body(world);
    expect(s.organs).toEqual([]);
    expect(beats(world, CFG.antiphonStillBeats + 1).has("antiphonShip")).toBe(true);
    const o = untilGrown(world);
    expect(o.shape).toBe(ANTIPHON_SHIP);
    expect(o.grownBeat - s.stillBeat).toBeGreaterThanOrEqual(CFG.antiphonStillBeats);
    expect(s.rail).toHaveLength(CFG.antiphonShipRail);
    expect(s.rail.every((c) => c.shape === ANTIPHON_SHIP)).toBe(true);
    antiphonStruck(world, shot(world, o.col, o.color));
    expect(s.downBeat).toBe(world.beat);
    expect(world.events.some((e) => e.type === "antiphonBurst")).toBe(true);
    const out = beats(world, CFG.antiphonOutBeats + 1);
    expect(out.has("antiphonOut")).toBe(true);
    expect(world.boss).toBeNull();
    expect(failHolds(world)).toBe(false);
  });

  it("hardens on the wrong ship and grows it again after the rest, without a second still", () => {
    const world = open();
    body(world).pits = [...Array(CFG.antiphonPits).keys()];
    untilGrown(world);
    const s = body(world);
    const d = decoys(s)[0];
    if (d === undefined) throw new Error("no decoy ship");
    antiphonStruck(world, shot(world, d.col, d.color));
    expect(s.downBeat).toBe(-1);
    expect(s.organs).toEqual([]);
    world.events.length = 0;
    const again = untilStanding(world);
    expect(again).toBeLessThanOrEqual(CFG.antiphonRestBeats + 1);
    expect(s.organs[0]?.shape).toBe(ANTIPHON_SHIP);
    expect(world.events.some((e) => e.type === "antiphonStill")).toBe(false);
  });
});

describe("determinism", () => {
  it("fingerprints the same for the same seed", () => {
    const a = open(11);
    const b = open(11);
    for (let i = 0; i < 12 * TPB; i++) {
      step(a, []);
      step(b, []);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
    expect(body(a).organs.length).toBeGreaterThan(0);
  });
});
