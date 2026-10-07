import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type SimEvent } from "@neon-spore/sim";
import { FlueBeam } from "../src/flue-beam.js";
import { flueSightR } from "../src/flue-shape.js";
import { FlueWord, flueMissHint } from "../src/flue-word.js";
import { computeLayout } from "../src/layout.js";
import { BOLT, posed, words } from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A shot met, hit or spent: the spore beamed out where it was and back in at
 * the left end (`flue-beam.ts`), and a spent one stamped MISS with what to
 * change (`flue-word.ts`).
 */

beforeAll(installCanvasGlobals);

const MID = midCol(CFG);
const hit: SimEvent = { type: "flueHit", hits: 1, left: 0, col: MID, emberMilli: 300 };
const miss = (why: "wide" | "color" | "weapon", late = false): SimEvent => ({
  type: "flueMiss",
  shots: 2,
  why,
  late,
  col: MID,
  emberMilli: -2500,
});

describe("THE FLUE's sight", () => {
  it("is as wide as a shot's reach, so a spore half inside it is met", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    expect(flueSightR(l)).toBeCloseTo((CFG.flueHitMilli / 1000) * l.tile, 6);
  });
});

describe("THE FLUE's beam", () => {
  it("beams the spore out where the shot met it, then back in, and is done", () => {
    const beam = new FlueBeam();
    expect(beam.out).toBeNull();
    expect(beam.present).toBe(1);
    beam.ingest([hit]);
    expect(beam.out?.milli).toBe(300);
    expect(beam.present).toBe(0);
    for (let i = 0; i < 12; i++) beam.update(1 / 60);
    expect(beam.out?.gone ?? 0).toBeGreaterThan(0.5);
    for (let i = 0; i < 20; i++) beam.update(1 / 60);
    expect(beam.out).toBeNull();
    expect(beam.present).toBeGreaterThan(0);
    expect(beam.present).toBeLessThan(1);
    for (let i = 0; i < 60; i++) beam.update(1 / 60);
    expect(beam.present).toBe(1);
  });

  it("beams it out on a miss too, and forgets on reset", () => {
    const beam = new FlueBeam();
    beam.ingest([miss("wide")]);
    expect(beam.out?.milli).toBe(-2500);
    beam.clear();
    expect(beam.out).toBeNull();
    expect(beam.present).toBe(1);
  });
});

describe("THE FLUE's MISS", () => {
  it("says what to change", () => {
    const hint = (e: SimEvent): string => (e.type === "flueMiss" ? flueMissHint(e) : "");
    expect(hint(miss("wide"))).toBe("TOO EARLY");
    expect(hint(miss("wide", true))).toBe("TOO LATE");
    expect(hint(miss("color"))).toBe("WRONG COLOUR");
    expect(hint(miss("weapon"))).toBe("WRONG SHOT");
  });

  it("stands a moment after a shot spent, and not after a hit", () => {
    const word = new FlueWord();
    word.ingest([miss("wide", true)]);
    expect(word.shown).toBe("TOO LATE");
    word.ingest([hit]);
    expect(word.shown).toBeNull();
    word.ingest([miss("color")]);
    for (let i = 0; i < 120; i++) word.update(1 / 60);
    expect(word.shown).toBeNull();
  });

  it.each(["p1", "p2"] as const)("is stamped on %s's screen", (role) => {
    const said = (thrown?: SimEvent): string[] =>
      words(role, (w) => posed(w, BOLT, -3000), thrown).map((t) => t.text);
    expect(said()).not.toContain("MISS");
    expect(said(miss("wide"))).toContain("MISS");
    expect(said(miss("wide"))).toContain("TOO EARLY");
  });
});
