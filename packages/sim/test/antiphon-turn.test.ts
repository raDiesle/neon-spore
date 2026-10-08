import { describe, expect, it } from "bun:test";
import { antiphonIsOrgan } from "../src/antiphon.js";
import { antiphonOpenLevel } from "../src/antiphon-step.js";
import {
  ANTIPHON_QUARTERS,
  antiphonOrganTurnMilli,
  antiphonQuarterMilli,
} from "../src/antiphon-turn.js";
import {
  createWorld,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  type World,
} from "../src/index.js";
import { body, CFG, carryHome, grown, TPB } from "./antiphon-kit.js";

/**
 * Step 8 of THE ANTIPHON: from `antiphonTurnPits` the organ rests at a
 * quarter turn the seed picks, the decoys are its own contour at the other
 * turns, and a thumb's turn springs back when it lifts (`antiphon-turn.ts`).
 * The receipts: the figure off changes nothing, the turn is the answer, the
 * ship is never turned, and the thumb's look-around still changes nothing.
 */

const ON: SimConfig = { ...CFG, antiphonRestingTurn: true, hullInvulnerable: true };
const WHOLE = TPB * CFG.antiphonTurnBeats;

/** A world on THE ANTIPHON at level `level`, its organ grown. */
function at(level: number, cfg: SimConfig = ON, seed = 3): World {
  const world = createWorld(cfg, seed);
  startWave(world, 6, [], [], { kind: "antiphon" });
  antiphonOpenLevel(world, body(world), level);
  grown(world);
  return world;
}

function hold(world: World, on: boolean): TimedCommand {
  return {
    tick: world.tick,
    player: 1,
    command: { kind: "drag", target: "antiphonOrgan", on, fromMilli: 0, fromYMilli: 0 },
  };
}

function run(world: World, n: number, commands: TimedCommand[] = []): void {
  step(world, commands);
  for (let i = 1; i < n; i++) step(world, []);
}

describe("THE ANTIPHON's resting turn", () => {
  it("is off by default: every organ and candidate hangs the way it was drawn", () => {
    for (let level = 0; level < CFG.antiphonPits; level++) {
      const s = body(at(level, { ...CFG, hullInvulnerable: true }));
      expect(s.organ?.turn).toBe(0);
      expect(s.rail.every((c) => c.turn === 0)).toBe(true);
    }
  });

  it("draws the same rail with the figure off as before it existed", () => {
    // The off figure takes nothing from the seed, so a level's rail is the
    // one any recorded replay already holds: on before the turn pits, the
    // two configs grow the same rail.
    const off = body(at(0, { ...CFG, hullInvulnerable: true }));
    const on = body(at(0));
    expect(on.rail).toEqual(off.rail);
    expect(on.answer).toBe(off.answer);
  });

  it("from the turn pits, hangs the organ's own contour at distinct turns", () => {
    // Every contour taken as one its turns tell apart; the one that is not is the test below.
    const cfg = { ...ON, antiphonHalfAlike: 0 };
    for (let seed = 1; seed <= 12; seed++) {
      const s = body(at(CFG.antiphonTurnPits, cfg, seed));
      const organ = s.organ;
      if (organ === null) throw new Error("no organ");
      expect(s.rail.every((c) => c.shape === organ.shape)).toBe(true);
      const turns = s.rail.map((c) => c.turn);
      expect(new Set(turns).size).toBe(turns.length);
      expect(turns.every((t) => t >= 0 && t < ANTIPHON_QUARTERS)).toBe(true);
      expect(s.rail[s.answer]?.turn).toBe(organ.turn);
    }
  });

  it("lets the seed pick the turn, so not every organ rests the way it was drawn", () => {
    const turns = new Set<number>();
    for (let seed = 1; seed <= 12; seed++)
      turns.add(body(at(CFG.antiphonTurnPits, ON, seed)).organ?.turn ?? -1);
    expect(turns.size).toBeGreaterThan(1);
  });

  it("before the turn pits, rests the organ unturned among other shapes", () => {
    const s = body(at(CFG.antiphonTurnPits - 1));
    expect(s.organ?.turn).toBe(0);
    expect(new Set(s.rail.map((c) => c.shape)).size).toBe(s.rail.length);
  });

  it("never turns the ship", () => {
    const world = at(CFG.antiphonPits);
    const s = body(world);
    expect(s.organ?.turn).toBe(0);
    expect(s.rail.every((c) => c.turn === 0)).toBe(true);
  });

  it("makes the turn the answer: the right turn is a pit, another turn strikes", () => {
    const world = at(CFG.antiphonTurnPits);
    const s = body(world);
    const pits = s.pits.length;
    expect(carryHome(world, s.answer).has("antiphonPit")).toBe(true);
    expect(s.pits.length).toBe(pits + 1);
    const again = at(CFG.antiphonTurnPits);
    const t = body(again);
    const wrong = t.rail.findIndex((_, i) => !antiphonIsOrgan(t, i));
    expect(carryHome(again, wrong).has("antiphonHarden")).toBe(true);
  });

  it("springs a thumb's turn back to the resting turn, the short way round", () => {
    const world = at(CFG.antiphonTurnPits);
    const s = body(world);
    const rest = antiphonQuarterMilli(s.organ?.turn ?? 0);
    run(world, WHOLE / 4, [hold(world, true)]);
    expect(antiphonOrganTurnMilli(s, ON)).toBe((rest + 250) % 1000);
    run(world, WHOLE / 4 / ON.antiphonSpringRate, [hold(world, false)]);
    expect(s.turnTicks).toBe(0);
    expect(antiphonOrganTurnMilli(s, ON)).toBe(rest);
    // Three quarters round, it springs on through the whole turn rather than back.
    run(world, (WHOLE * 3) / 4, [hold(world, true)]);
    step(world, [hold(world, false)]);
    expect(s.turnTicks).toBe((WHOLE * 3) / 4 + ON.antiphonSpringRate);
    run(world, WHOLE / 4 / ON.antiphonSpringRate);
    expect(s.turnTicks).toBe(0);
  });

  it("leaves a lifted turn where it is on a level that rests unturned", () => {
    const world = at(CFG.antiphonTurnPits - 1);
    const s = body(world);
    run(world, WHOLE / 4, [hold(world, true)]);
    run(world, TPB, [hold(world, false)]);
    expect(s.turnTicks).toBe(WHOLE / 4);
  });

  it("puts every candidate's turn in the hash", () => {
    const world = at(CFG.antiphonTurnPits);
    const before = hashWorld(world);
    const c = body(world).rail[0];
    if (c === undefined) throw new Error("no rail");
    c.turn = (c.turn + 1) % ANTIPHON_QUARTERS;
    expect(hashWorld(world)).not.toBe(before);
  });

  it("never shows a contour alike at a half turn beside itself upside down", () => {
    /** Whether the rail holds the organ's own contour half a turn from it. */
    const upsideDown = (w: World) => {
      const s = body(w);
      const o = s.organ;
      if (o === null) return false;
      return s.rail.some((c) => c.shape === o.shape && (c.turn - o.turn + 4) % 4 === 2);
    };
    const levels = (cfg: SimConfig) =>
      [1, 2, 3, 4, 5, 6, 7, 8].flatMap((seed) => [2, 3, 4].map((level) => at(level, cfg, seed)));
    expect(levels({ ...ON, antiphonHalfAlike: 0 }).some(upsideDown)).toBe(true);
    const alike = levels({ ...ON, antiphonHalfAlike: 0xffff });
    expect(alike.some(upsideDown)).toBe(false);
    // The place it would have taken is another shape, so the rail is no shorter.
    for (const w of alike) expect(body(w).rail.length).toBe(CFG.antiphonRail);
  });
});
