import { describe, expect, it } from "bun:test";
import { gorgeAlong } from "../src/gorge-step.js";
import {
  gorgeBottom,
  gorgeColOf,
  gorgeDue,
  gorgeOwed,
  gorgePhase,
  gorgeRowOf,
  gorgeSated,
  hashWorld,
  MILLI,
  midCol,
} from "../src/index.js";
import { beats, CFG, hit, MIXED, ORDERED, open, RING, ROW, sack, sate, shot } from "./gorge-kit.js";

/**
 * THE GORGE, and the sentence the owner gave it on 1 October 2026: **bubbles
 * that each want so many shots of a colour, one of you counting and the other
 * colouring.** Five levels, each one hung by the seed: a row in any order, a
 * row in one order, a ring that turns and is opened at the bottom, and
 * bubbles that want both colours. What is checked here is the rule and
 * nothing of the look; the tap is `gorge-hand.test.ts`.
 */

describe("THE GORGE's bubbles", () => {
  it("hangs the first level centred, each bubble wanting one colour, in no order", () => {
    const g = sack(open([ROW]));
    expect(gorgePhase(g)).toBe("row");
    expect(g.intakes).toHaveLength(4);
    expect(g.col).toBe(midCol(CFG) - 2);
    for (const k of g.intakes) {
      expect(gorgeOwed(k)).toBeGreaterThanOrEqual(ROW.needMin);
      expect(gorgeOwed(k)).toBeLessThanOrEqual(ROW.needMax);
      expect(k.needRed === 0 || k.needCyan === 0).toBe(true);
      expect(k.order).toBe(-1);
    }
  });

  it("rolls the wants off the seed: the same seed the same sum, another seed another", () => {
    const wants = (seed: number) =>
      sack(open([ROW], seed)).intakes.map((k) => `${k.needRed}r${k.needCyan}c`);
    expect(wants(5)).toEqual(wants(5));
    const seen = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((s) => wants(s).join(" ")));
    expect(seen.size).toBeGreaterThan(1);
  });

  it("swallows its colour, and a wrong one takes a shot back out", () => {
    const world = open([ROW]);
    const g = sack(world);
    const i = g.intakes.findIndex((k) => k.needRed >= 2);
    const at = i >= 0 ? i : g.intakes.findIndex((k) => k.needCyan >= 2);
    const k = g.intakes[at];
    if (k === undefined) throw new Error("seed 3 rolls no bubble wanting two");
    const right = k.needRed > 0 ? "red" : "cyan";
    const wrong = right === "red" ? "cyan" : "red";
    expect(hit(world, at, right)).toEqual(["gorgeSwallow"]);
    expect(k.gotRed + k.gotCyan).toBe(1);
    expect(hit(world, at, wrong)).toEqual(["gorgeEmptied"]);
    expect(k.gotRed + k.gotCyan).toBe(0);
    // Nothing to take out of an empty bubble, and nothing goes under nought.
    hit(world, at, wrong);
    expect(k.gotRed + k.gotCyan).toBe(0);
  });

  it("meets a shot mid-field in its column, and lets one past a sated bubble", () => {
    const world = open([ROW]);
    const g = sack(world);
    const col = gorgeColOf(CFG, g, 0);
    const at = gorgeRowOf(CFG, g) * MILLI;
    expect(gorgeAlong(world, shot(world, col, "red"), at + 500, at - 500)).toBe(at);
    expect(gorgeAlong(world, shot(world, g.col - 1, "red"), at + 500, at - 500)).toBe(-1);
    sate(world, 0);
    expect(gorgeAlong(world, shot(world, col, "red"), at + 500, at - 500)).toBe(-1);
  });

  it("clears the level when the last bubble is full, and hangs the next after the gap", () => {
    const world = open([ROW, ORDERED]);
    const g = sack(world);
    for (let i = 0; i < 3; i++) sate(world, i);
    expect(gorgePhase(g)).toBe("row");
    sate(world, 3);
    expect(gorgePhase(g)).toBe("clear");
    beats(world, CFG.gorgeLevelGapBeats + 1);
    expect(g.level).toBe(1);
    expect(g.intakes).toHaveLength(ORDERED.intakes);
    expect(g.intakes.map((k) => k.order).sort()).toEqual([0, 1, 2, 3, 4]);
  });

  it("on an ordered row, spits back a shot into a bubble not yet due", () => {
    const world = open([ORDERED]);
    const g = sack(world);
    const first = g.intakes.findIndex((k) => k.order === 0);
    const later = g.intakes.findIndex((k) => k.order === 1);
    const k = g.intakes[later];
    if (k === undefined) throw new Error("no second bubble");
    const before = world.creatures.length;
    expect(hit(world, later, k.needRed > 0 ? "red" : "cyan")).toContain("gorgeSpit");
    expect(world.creatures.length).toBe(before + 1);
    expect(gorgeSated(k) || k.gotRed + k.gotCyan > 0).toBe(false);
    sate(world, first);
    expect(gorgeDue(g, later)).toBe(true);
  });

  it("on a ring, hangs lower, and only the bottom bubble has a column", () => {
    const world = open([RING]);
    const g = sack(world);
    expect(gorgePhase(g)).toBe("ring");
    expect(gorgeRowOf(CFG, g)).toBe(CFG.gorgeRow + CFG.gorgeRingRows);
    const cols = g.intakes.map((_, i) => gorgeColOf(CFG, g, i));
    expect(cols.filter((c) => c >= 0)).toEqual([midCol(CFG)]);
    expect(cols[gorgeBottom(g)]).toBe(midCol(CFG));
  });

  it("turns every gorgeTurnBeats, past the bubbles already full", () => {
    const world = open([RING]);
    const g = sack(world);
    const k = g.intakes[1];
    if (k === undefined) throw new Error("no bubble 1");
    k.gotRed = k.needRed;
    k.gotCyan = k.needCyan;
    expect(gorgeBottom(g)).toBe(0);
    expect(beats(world, CFG.gorgeTurnBeats)).toContain("gorgeTurn");
    expect(gorgeBottom(g)).toBe(2);
  });

  it("wants both colours in every mixed bubble", () => {
    const world = open([MIXED]);
    const g = sack(world);
    for (const k of g.intakes) {
      expect(k.needRed).toBeGreaterThan(0);
      expect(k.needCyan).toBeGreaterThan(0);
    }
  });

  it("goes out after the last level, and stands gorgeOutBeats before it is gone", () => {
    const world = open([ROW]);
    for (let i = 0; i < 4; i++) sate(world, i);
    expect(beats(world, CFG.gorgeLevelGapBeats + 1)).toContain("gorgeOut");
    expect(gorgePhase(sack(world))).toBe("out");
    beats(world, CFG.gorgeOutBeats + 1);
    expect(world.boss).toBeNull();
  });

  it("is fingerprinted: a shot swallowed on one device and not the other is seen", () => {
    const a = open([ROW]);
    const b = open([ROW]);
    expect(hashWorld(a)).toBe(hashWorld(b));
    const k = sack(a).intakes[0];
    hit(a, 0, k !== undefined && k.needRed > 0 ? "red" : "cyan");
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
