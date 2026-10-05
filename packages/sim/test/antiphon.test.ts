import { describe, expect, it } from "bun:test";
import {
  ANTIPHON_SHIP,
  antiphonChooser,
  antiphonExplainer,
  antiphonFamilyOf,
  antiphonIsOrgan,
  antiphonSinkBeat,
} from "../src/antiphon.js";
import { antiphonSlotCol } from "../src/antiphon-vein.js";
import { bossFillsWave, bossHoldsWave } from "../src/boss-kinds.js";
import { hashWorld, midCol, setBossRound, step } from "../src/index.js";
import { failHolds } from "../src/wave-fail.js";
import { beats, body, CFG, carryHome, grown, open, TPB } from "./antiphon-kit.js";

/**
 * THE ANTIPHON: the boss that is a question about describing a thing with
 * no name, redesigned on 5 October 2026 so the answer is carried rather
 * than shot.
 *
 * What these pin is the clock and the judgment. That the body rises smooth
 * with nothing on the field; that after `antiphonRestBeats` an organ grows
 * on a rail of `antiphonRail` candidates with distinct shapes, hung at
 * their slots on the rail's row, the organ among them; that the organ
 * carried down its vein makes a pit and ends the level with nothing struck,
 * and a decoy carried there strikes the hull; that the window runs out after
 * `antiphonWindowBeats` and strikes the hull too; that the seats swap every
 * level; that the rail closes on the organ's family from `antiphonTightPits`
 * with the window tightened and a pit grows again from `antiphonEchoPits`;
 * that with every pit taken the surface goes still, the ship grows on a rail
 * of ships and the right one bursts it; that the director's stepper stands
 * the fight on any level; and that the body is out after `antiphonOutBeats`.
 * The carry itself is `antiphon-carry.test.ts`.
 *
 * The fingerprint is compared between two runs in one process rather than
 * pinned (`docs/decisions.md` #19).
 */

/** Whether the hull was struck: the wave lost. */
function struck(world: ReturnType<typeof open>): boolean {
  return failHolds(world) || world.failTick >= 0;
}

describe("the body rising", () => {
  it("rises smooth, with nothing on the rail and nothing on the field", () => {
    const world = open();
    const s = body(world);
    expect(s.organ).toBeNull();
    expect(s.rail).toEqual([]);
    expect(s.pits).toEqual([]);
    expect(world.creatures).toHaveLength(0);
    expect(world.events.some((e) => e.type === "antiphonEnter")).toBe(true);
  });

  it("is a fixture that holds its wave and fills it", () => {
    expect(bossHoldsWave("antiphon")).toBe(true);
    expect(bossFillsWave("antiphon")).toBe(true);
  });

  it("rests, then grows one organ on a rail of distinct shapes hung at their slots", () => {
    const world = open();
    const seen = beats(world, CFG.antiphonRestBeats + 1);
    expect(seen.has("antiphonGrow")).toBe(true);
    const s = body(world);
    expect(s.rail).toHaveLength(CFG.antiphonRail);
    expect(new Set(s.rail.map((c) => c.shape)).size).toBe(CFG.antiphonRail);
    expect(s.rail.map((c) => c.col)).toEqual(
      s.rail.map((_, i) => antiphonSlotCol(CFG, s.rail.length, i)),
    );
    expect(s.rail[s.answer]?.shape).toBe(s.organ?.shape);
    expect(world.creatures).toHaveLength(0);
  });

  it("hangs the rail three columns apart about the middle", () => {
    expect([0, 1, 2].map((i) => antiphonSlotCol(CFG, 3, i))).toEqual([
      midCol(CFG) - 3,
      midCol(CFG),
      midCol(CFG) + 3,
    ]);
  });
});

describe("the judgment", () => {
  it("takes the organ carried to its place to a pit and ends the level, nothing struck", () => {
    const world = open();
    const s = grown(world);
    const shape = s.organ?.shape;
    const seen = carryHome(world, s.answer);
    expect(seen.has("antiphonPit")).toBe(true);
    expect(s.pits).toEqual([shape ?? -9]);
    expect(s.organ).toBeNull();
    expect(s.rail).toEqual([]);
    expect(struck(world)).toBe(false);
    expect(world.creatures).toHaveLength(0);
  });

  it("strikes the hull on a decoy carried to the organ's place", () => {
    const world = open();
    const s = grown(world);
    const d = s.rail.findIndex((_, i) => !antiphonIsOrgan(s, i));
    const seen = carryHome(world, d);
    expect(seen.has("antiphonHarden")).toBe(true);
    expect(s.pits).toEqual([]);
    expect(s.organ).toBeNull();
    expect(struck(world)).toBe(true);
  });

  it("plays the level again after a wrong answer on a hull that cannot be struck", () => {
    const world = open(3, false);
    const s = grown(world);
    carryHome(
      world,
      s.rail.findIndex((_, i) => !antiphonIsOrgan(s, i)),
    );
    expect(s.pits).toEqual([]);
    grown(world);
    expect(s.organ).not.toBeNull();
  });
});

describe("the window", () => {
  it("runs out after antiphonWindowBeats, the organ sinks and the hull is struck", () => {
    const world = open();
    const s = grown(world);
    const end = antiphonSinkBeat(s, CFG);
    expect(end - world.beat).toBe(CFG.antiphonWindowBeats);
    const seen = new Set<string>();
    while (world.beat < end) {
      step(world, []);
      for (const e of world.events) seen.add(e.type);
    }
    expect(seen.has("antiphonSink")).toBe(true);
    expect(s.organ).toBeNull();
    expect(struck(world)).toBe(true);
  });

  it("tightens from antiphonTightPits, and the rail closes on the organ's family", () => {
    const world = open();
    const s = body(world);
    s.pits = [12, 13];
    grown(world);
    expect(antiphonSinkBeat(s, CFG) - world.beat).toBe(CFG.antiphonTightWindowBeats);
    const fam = antiphonFamilyOf(CFG, s.organ?.shape ?? 0);
    const kin = s.rail.filter((c) => antiphonFamilyOf(CFG, c.shape) === fam);
    expect(kin.length).toBeGreaterThanOrEqual(2);
  });

  it("grows a pit again from antiphonEchoPits", () => {
    const world = open();
    const s = body(world);
    s.pits = [0, 1, 2, 3, 4];
    grown(world);
    expect(s.pits).toContain(s.organ?.shape ?? -9);
  });
});

describe("the seats", () => {
  it("swap every level: the pilot explains first, the navigator next", () => {
    const world = open();
    const s = body(world);
    expect(antiphonExplainer(s)).toBe(1);
    expect(antiphonChooser(s)).toBe(2);
    carryHome(world, grown(world).answer);
    expect(s.pits).toHaveLength(1);
    expect(antiphonExplainer(s)).toBe(2);
    expect(antiphonChooser(s)).toBe(1);
    carryHome(world, grown(world).answer);
    expect(s.pits).toHaveLength(2);
    expect(antiphonExplainer(s)).toBe(1);
  });
});

describe("the ship", () => {
  it("goes still with every pit taken, grows the ship on a rail of ships, and the right one bursts it", () => {
    const world = open();
    const s = body(world);
    s.pits = [...Array(CFG.antiphonPits).keys()];
    const still = beats(world, CFG.antiphonRestBeats + 1);
    expect(still.has("antiphonStill")).toBe(true);
    grown(world);
    expect(s.organ?.shape).toBe(ANTIPHON_SHIP);
    expect(s.rail).toHaveLength(CFG.antiphonShipRail);
    expect(s.rail.every((c) => c.shape === ANTIPHON_SHIP)).toBe(true);
    const seen = carryHome(world, s.answer);
    expect(seen.has("antiphonBurst")).toBe(true);
    expect(s.downBeat).toBe(world.beat);
    const out = beats(world, CFG.antiphonOutBeats + 1);
    expect(out.has("antiphonOut")).toBe(true);
    expect(world.boss).toBeNull();
    expect(struck(world)).toBe(false);
  });
});

describe("the director's stepper", () => {
  it("stands the fight on any level through setBossRound, the ship last", () => {
    for (let level = 0; level <= CFG.antiphonPits; level++) {
      const world = open();
      expect(setBossRound(world, level)).toBe(true);
      const s = grown(world);
      expect(s.pits).toHaveLength(level);
      expect(s.organ?.shape === ANTIPHON_SHIP).toBe(level === CFG.antiphonPits);
      expect(antiphonExplainer(s)).toBe(level % 2 === 0 ? 1 : 2);
    }
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
    expect(body(a).organ).not.toBeNull();
  });
});
