import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { midCol, type SimEvent } from "@neon-spore/sim";
import { flueBareness } from "../src/flue-bare.js";
import { rgba } from "../src/hex.js";
import { PALETTE } from "../src/palette.js";
import { BOLT, count, frame, posed, stood } from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The spore bare and red over the cannon, shielded everywhere else, and a
 * shot spent stinging red at the sight (`flue-bare.ts`, `flue-sting.ts`).
 */

beforeAll(installCanvasGlobals);

/** A cyan level, so the sight is not drawn in the red these count. */
const CYAN = { ...BOLT, color: "cyan" as const };
const HIT = CFG.flueHitMilli;

/** How often a frame sets `hex`, as a hex string or in an `rgba`. */
function sets(text: string, hex: string): number {
  return count(text.toLowerCase(), hex.toLowerCase()) + count(text, rgba(hex, 1).slice(0, -2));
}

describe("THE FLUE's spore, bare or shielded", () => {
  it("is bare over the cannon, reddest at the middle, and counts the beats since it came", () => {
    const world = stood();
    const s = posed(world, CYAN, 0);
    const middle = flueBareness(CFG, s);
    expect(middle.over).toBe(true);
    expect(middle.red).toBeCloseTo(1);
    expect(middle.since).toBeCloseTo(HIT / CYAN.speedMilli);
    s.emberMilli = HIT;
    const edge = flueBareness(CFG, s);
    expect(edge.over).toBe(true);
    expect(edge.red).toBeLessThan(middle.red);
  });

  it("is shielded coming, and closing its shield just after it left", () => {
    const world = stood();
    const s = posed(world, CYAN, -2000);
    expect(flueBareness(CFG, s)).toMatchObject({ over: false, red: 0, since: Infinity });
    s.emberMilli = HIT + 200;
    const left = flueBareness(CFG, s);
    expect(left.over).toBe(false);
    expect(left.since).toBeCloseTo(200 / CYAN.speedMilli);
    // Running back the other way from the right end, it is coming again.
    s.emberDir = -1;
    expect(flueBareness(CFG, s).since).toBe(Infinity);
  });

  it("is shielded between levels, wherever the ember stands", () => {
    const world = stood();
    expect(flueBareness(CFG, posed(world, null, 0)).over).toBe(false);
  });

  it("draws red on the pilot's spore over the cannon, and nothing of it on the navigator's", () => {
    const over = frame("p1", (w) => posed(w, CYAN, 0));
    const away = frame("p1", (w) => posed(w, CYAN, -3000));
    expect(sets(over, PALETTE.red)).toBeGreaterThan(sets(away, PALETTE.red));
    const p2over = frame("p2", (w) => posed(w, CYAN, 0));
    const p2away = frame("p2", (w) => posed(w, CYAN, -3000));
    expect(sets(p2over, PALETTE.red)).toBe(sets(p2away, PALETTE.red));
  });

  it("fills the shield round the pilot's spore away from the cannon, and not over it", () => {
    // Counted by the bubble's own fill, in the shield's colour under an alpha,
    // on a red level: the shield's cyan is the cyan cannon's too.
    const bubble = `fillStyle=${rgba(PALETTE.shield, 1).slice(0, -2)}`;
    const away = frame("p1", (w) => posed(w, BOLT, -3000));
    const leaving = frame("p1", (w) => posed(w, BOLT, HIT + 100));
    const over = frame("p1", (w) => posed(w, BOLT, 0));
    const navigator = frame("p2", (w) => posed(w, BOLT, -3000));
    expect(count(away, bubble)).toBeGreaterThan(count(over, bubble));
    expect(count(leaving, bubble)).toBeGreaterThan(count(over, bubble));
    expect(leaving).not.toBe(away);
    // The navigator's own marks fill in it too; the bubble adds nothing to them.
    const navigatorOver = frame("p2", (w) => posed(w, BOLT, 0));
    expect(count(navigator, bubble)).toBe(count(navigatorOver, bubble));
  });
});

describe("THE FLUE's shot spent", () => {
  it("stings red at the sight on both screens", () => {
    const miss: SimEvent = {
      type: "flueMiss",
      shots: 2,
      why: "wide",
      col: midCol(CFG),
      late: false,
      emberMilli: 0,
    };
    for (const role of ["p1", "p2"] as const) {
      const calm = frame(role, (w) => posed(w, CYAN, -3000));
      const stung = frame(role, (w) => posed(w, CYAN, -3000), miss);
      expect(sets(stung, PALETTE.red)).toBeGreaterThan(sets(calm, PALETTE.red));
    }
  });
});
