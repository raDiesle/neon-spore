import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { GORGE_LEVELS } from "@neon-spore/content";
import {
  createWorld,
  type GorgeIntake,
  type GorgeState,
  gorgeBoss,
  startWave,
} from "@neon-spore/sim";
import { gorgeBubbleAt, gorgeOrderAt, gorgeTallyAt } from "../src/gorge-place.js";
import { gorgeRedShare } from "../src/gorge-want.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Where THE GORGE's ring stands as it turns** (`gorge-place.ts`): swung
 * round from where it stood before, through every bubble the turn skipped,
 * and settled after; and **the share a two-tone bubble is split at**
 * (`gorge-want.ts`).
 */

const l = computeLayout(VIEWPORT, CFG, "p1");

/** The first ring of the authored levels, turned from `from` to `to` on beat 10. */
function turned(from: number, to: number): GorgeState {
  const world = createWorld(CFG, 5);
  startWave(world, waveWith("gorge"), [], [], { kind: "gorge", levels: GORGE_LEVELS.slice(2) });
  const g = gorgeBoss(world);
  if (g === null) throw new Error("the gorge wave installed no sack");
  return Object.assign(g, { turn: to, turnFrom: from, turnBeat: 10 });
}

describe("the ring's swing", () => {
  it("starts where the ring stood before the turn, skipped bubbles and all", () => {
    for (const steps of [1, 2, 3]) {
      const g = turned(1, 1 + steps);
      const before = turned(1, 1);
      for (let i = 0; i < g.intakes.length; i++) {
        const now = gorgeBubbleAt(l, CFG, g, i, 10);
        const was = gorgeBubbleAt(l, CFG, before, i);
        expect(now.x).toBeCloseTo(was.x, 6);
        expect(now.y).toBeCloseTo(was.y, 6);
      }
    }
  });

  it("is settled a beat later, where a cue and a caption ask for it", () => {
    const g = turned(1, 3);
    for (let i = 0; i < g.intakes.length; i++) {
      expect(gorgeBubbleAt(l, CFG, g, i, 11)).toEqual(gorgeBubbleAt(l, CFG, g, i));
    }
  });

  it("is halfway round in between, and never moves a ring that has not turned", () => {
    const g = turned(1, 2);
    const bottom = 2 % g.intakes.length;
    const start = gorgeBubbleAt(l, CFG, g, bottom, 10);
    const mid = gorgeBubbleAt(l, CFG, g, bottom, 10.25);
    const end = gorgeBubbleAt(l, CFG, g, bottom);
    expect(mid.x).not.toBeCloseTo(start.x, 3);
    expect(mid.x).not.toBeCloseTo(end.x, 3);
    const still = turned(2, 2);
    expect(gorgeBubbleAt(l, CFG, still, 0, 10)).toEqual(gorgeBubbleAt(l, CFG, still, 0));
  });
});

describe("the pilot's numbers round a ring", () => {
  it("put no bubble's place in the order on another's count, or on its own", () => {
    const g = turned(0, 0);
    for (let i = 0; i < g.intakes.length; i++) {
      const o = gorgeOrderAt(l, CFG, g, i);
      for (let j = 0; j < g.intakes.length; j++) {
        const t = gorgeTallyAt(l, CFG, g, j);
        expect(Math.hypot(o.x - t.x, o.y - t.y)).toBeGreaterThan(l.tile * 0.5);
      }
    }
  });
});

describe("the two-tone share", () => {
  const k = (needRed: number, needCyan: number): GorgeIntake => ({
    needRed,
    needCyan,
    gotRed: 0,
    gotCyan: 0,
    order: -1,
    taps: 0,
  });

  it("is the red share of the shots wanted", () => {
    expect(gorgeRedShare(k(3, 0))).toBe(1);
    expect(gorgeRedShare(k(0, 2))).toBe(0);
    expect(gorgeRedShare(k(1, 2))).toBeCloseTo(1 / 3, 9);
  });
});
