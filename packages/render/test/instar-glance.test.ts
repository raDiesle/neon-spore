import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_GLANCE, INSTAR_TAIL_REST } from "../src/instar-glance.js";
import { GLANCE_ROUND, glanceAt } from "../src/instar-glance-styles.js";
import type { Look } from "../src/instar-plate.js";
import { tailShape } from "../src/instar-tail.js";
import { TAIL_ROUND, tailLeanAt } from "../src/instar-tail-lean.js";
import { EYE_X, turnedHeadPoint } from "../src/instar-turn.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Where THE INSTAR's head and resting tail look** (`instar-glance.ts`):
 * the head turns through a round each of three glances and the resting tail
 * through a round each of two ways of leaning; a glance swings the snout and holds the two eyes
 * where their marks are; a lean moves the resting tail and never a lashing
 * one, whose fork is over its marks.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
const HEAD = { x: 200, y: 300 };
const R = 80;

/** Where `turnedHeadPoint` draws `p` with the glance held at `swing` and `roll`. */
function posed(swing: number, roll: number, p: { x: number; y: number }) {
  const was = { ...INSTAR_GLANCE };
  INSTAR_GLANCE.swing = () => swing;
  INSTAR_GLANCE.roll = () => roll;
  try {
    return turnedHeadPoint(HEAD, R, { side: 0, time: 1 }, p);
  } finally {
    Object.assign(INSTAR_GLANCE, was);
  }
}

describe("THE INSTAR's glance", () => {
  it("ships turning in all three glances, handing over without a jump", () => {
    // COCK, SWAY, COCK, LOOK: each swings both ways, and only COCK and LOOK roll.
    const rounds = [0, 1, 2, 3].map((k) =>
      Array.from({ length: 120 }, (_, i) => glanceAt(k * GLANCE_ROUND + (i * GLANCE_ROUND) / 120)),
    );
    for (const round of rounds) {
      const swings = round.map((g) => g.swing);
      expect(Math.max(...swings) - Math.min(...swings)).toBeGreaterThan(0.3);
    }
    const rolls = rounds.map((round) => Math.max(...round.map((g) => Math.abs(g.roll))));
    expect(rolls[0]).toBeGreaterThan(0.05);
    expect(rolls[1]).toBe(0);
    expect(rolls[2]).toBeGreaterThan(0.05);
    expect(rolls[3]).toBeGreaterThan(0.02);
    expect(glanceAt(2 * GLANCE_ROUND + 1)).toEqual(glanceAt(1));
    // Across every hand-over the head is where it was a moment before.
    for (let k = 1; k <= 8; k++) {
      const a = glanceAt(k * GLANCE_ROUND - 1e-6);
      const z = glanceAt(k * GLANCE_ROUND);
      expect(Math.abs(a.swing - z.swing)).toBeLessThan(1e-4);
      expect(Math.abs(a.roll - z.roll)).toBeLessThan(1e-4);
    }
    expect(INSTAR_GLANCE.swing(1)).toBeCloseTo(glanceAt(1).swing, 9);
  });

  it("swings the snout by the glance and holds both eyes where they were", () => {
    expect(posed(0.3, 0, HEAD).x - posed(0, 0, HEAD).x).toBeCloseTo(0.3 * R, 6);
    for (const s of [-1, 1]) {
      const eye = { x: HEAD.x + s * EYE_X * R, y: HEAD.y };
      expect(posed(0.3, 0, eye).x).toBeCloseTo(posed(0, 0, eye).x, 6);
    }
  });

  it("rolls the head about its centre", () => {
    const brow = { x: HEAD.x + R * 0.4, y: HEAD.y - R * 0.5 };
    const was = posed(0, 0, brow);
    const now = posed(0, 0.1, brow);
    expect(Math.hypot(now.x - HEAD.x, now.y - HEAD.y)).toBeCloseTo(
      Math.hypot(was.x - HEAD.x, was.y - HEAD.y),
      6,
    );
    expect(now.y).not.toBeCloseTo(was.y, 1);
  });
});

describe("THE INSTAR's resting tail", () => {
  const look = (tail: number) =>
    ({ f: { tail, tailX: 500, tailY: 560 }, r: 40, time: 1, threat: 0 }) as unknown as Look;
  const REAR = { x: 300, y: 300 };
  const leaning = (lean: number, tail: number) => {
    const was = INSTAR_TAIL_REST.lean;
    INSTAR_TAIL_REST.lean = () => lean;
    try {
      return tailShape(L, look(tail), REAR);
    } finally {
      INSTAR_TAIL_REST.lean = was;
    }
  };

  it("ships leaning every way in both rounds, STATIONS holding and PENDULUM never, without a jump", () => {
    const rounds = [0, 1].map((k) =>
      Array.from({ length: 120 }, (_, i) => tailLeanAt(k * TAIL_ROUND + (i * TAIL_ROUND) / 120)),
    );
    for (const round of rounds) {
      expect(Math.min(...round)).toBeLessThan(-0.95);
      expect(Math.max(...round)).toBeGreaterThan(0.95);
    }
    const held = (round: number[]) => round.filter((v, i) => i > 0 && v === round[i - 1]).length;
    expect(held(rounds[0] as number[])).toBeGreaterThan(60);
    expect(held(rounds[1] as number[])).toBe(0);
    for (let k = 1; k <= 4; k++) {
      expect(Math.abs(tailLeanAt(k * TAIL_ROUND - 1e-6) - tailLeanAt(k * TAIL_ROUND))).toBeLessThan(
        1e-4,
      );
    }
    expect(INSTAR_TAIL_REST.lean(7)).toBeCloseTo(tailLeanAt(7), 9);
    // Every glance meets both ways: half a second in, STATIONS still stands straight up.
    const met = new Set<string>();
    for (let k = 0; k < 8; k++) {
      const at = k * TAIL_ROUND + 0.5;
      met.add(`${k % 4 === 3 ? "look" : k % 2 ? "sway" : "cock"} ${tailLeanAt(at) === 0}`);
    }
    expect(met.size).toBe(6);
  });

  it("leans the resting fork from the right of the rear to its left", () => {
    expect(leaning(1, 0).fork.x).toBeGreaterThan(REAR.x);
    expect(leaning(-1, 0).fork.x).toBeLessThan(REAR.x);
  });

  it("leaves a lashing tail where its marks are, whatever the lean", () => {
    expect(leaning(-1, 1).fork).toEqual(leaning(1, 1).fork);
  });
});
