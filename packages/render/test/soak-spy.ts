import type { Point } from "@neon-spore/content";
import { SOAK_HOLD, type SoakHoldDraw } from "../src/soak-hold.js";

/**
 * **What the HOLD LAB's drop was asked to draw**, and nothing drawn: for a
 * boss's test that asks *is the hold there, held, how full, whose* — the
 * drop's own look lights itself with gradients of its own (`goo-drop-look.ts`),
 * which a test counting the boss's would otherwise count too. `pull-spy.ts`
 * is the same for the pull.
 */
export interface SoakSpied {
  readonly at: Point;
  readonly r: number;
  readonly o: SoakHoldDraw;
}

export function spyHolds<T>(run: () => T): { holds: SoakSpied[]; out: T } {
  const inner = SOAK_HOLD.paint;
  const holds: SoakSpied[] = [];
  SOAK_HOLD.paint = (_c, at, r, o) => {
    holds.push({ at: { x: at.x, y: at.y }, r, o });
  };
  try {
    return { holds, out: run() };
  } finally {
    SOAK_HOLD.paint = inner;
  }
}
