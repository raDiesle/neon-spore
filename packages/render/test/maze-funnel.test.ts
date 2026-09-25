import { describe, expect, it } from "bun:test";
import {
  DEFAULT_CONFIG as CFG,
  MAZE_TURN,
  type MazeWheel,
  mazeEntranceAngle,
  mazeEntranceCol,
  mazeWheel,
} from "@neon-spore/sim";
import { FUNNEL_DEPTH, mazeFunnelHalfMilli, mazeFunnelLips } from "../src/maze-funnel.js";

/**
 * THE MAZE's way in as a funnel, held to the one promise that makes it more
 * than paint: **its mouth is the snap window**. A way in whose angle is inside
 * the mouth clicks onto the column, and one outside it does not — so what a
 * pair sees at the rim is what the rule will catch (`maze-funnel.ts`).
 */

const DRUM = { cx: 450, cy: 500, r: 300 };

/** Three rings and one way in, at the bottom of the rim. */
function wheel(): MazeWheel {
  return mazeWheel(
    {
      rings: 3,
      coreMilli: 250,
      openMilli: 55,
      walls: [[], [0, 180_000], [0, 180_000], [90_000]],
      openings: [[90_000, 270_000], [45_000, 225_000], [45_000, 225_000], [0]],
    },
    0,
  );
}

describe("THE MAZE's funnel", () => {
  it("is wider at its mouth than at the rim", () => {
    const w = wheel();
    const inner = mazeFunnelHalfMilli(CFG, w, DRUM.r, 0);
    const mouth = mazeFunnelHalfMilli(CFG, w, DRUM.r, 1);
    expect(mouth).toBeGreaterThan(inner * 1.3);
  });

  it("has a mouth exactly as wide as the angle a way in clicks from", () => {
    const w = wheel();
    const mouth = mazeFunnelHalfMilli(CFG, w, DRUM.r, 1);
    let caught = 0;
    for (let a = -12_000; a <= 12_000; a += 50) {
      const theta = mazeEntranceAngle(w, a, 0);
      const off = theta > MAZE_TURN / 2 ? theta - MAZE_TURN : theta;
      // A tenth of a degree either side for the sine table's own steps.
      if (Math.abs(Math.abs(off) - mouth) < 100) continue;
      const clicks = mazeEntranceCol(CFG, w, a, 0) >= 0;
      expect(clicks).toBe(Math.abs(off) < mouth);
      if (clicks) caught++;
    }
    expect(caught).toBeGreaterThan(10);
  });

  it("runs its lips from the rim's cut ends out to the mouth", () => {
    const w = wheel();
    const lips = mazeFunnelLips(CFG, w, DRUM, 0);
    expect(lips.length).toBe(2);
    for (const lip of lips) {
      const rIn = Math.hypot(lip.from.x - DRUM.cx, lip.from.y - DRUM.cy);
      const rOut = Math.hypot(lip.to.x - DRUM.cx, lip.to.y - DRUM.cy);
      expect(rIn).toBeCloseTo(DRUM.r, 6);
      expect(rOut).toBeCloseTo(DRUM.r * (1 + FUNNEL_DEPTH), 6);
    }
    const [a, b] = lips;
    if (a === undefined || b === undefined) throw new Error("no lips");
    const wideIn = Math.hypot(a.from.x - b.from.x, a.from.y - b.from.y);
    const wideOut = Math.hypot(a.to.x - b.to.x, a.to.y - b.to.y);
    expect(wideOut).toBeGreaterThan(wideIn);
  });
});
