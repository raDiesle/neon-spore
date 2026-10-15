import type { MirrorState } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { CFG } from "./frame-harness.js";

/**
 * THE MIRROR's states the grip's two test files share
 * (`mirror-grip.test.ts`, the press; `mirror-grip-draw.test.ts`, the
 * picture), and the screen they are read on.
 */

export const layout = (role: ViewRole) =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The last round, listening: `reflect`. */
export function mirror(overrides: Partial<MirrorState> = {}): MirrorState {
  return {
    kind: "mirror",
    rounds: [["guard"], ["cannonLeft", "guard", "fireRed"]],
    round: 1,
    phase: "listen",
    phaseBeat: 4,
    matched: 0,
    shown: 3,
    // Its cannon two columns off the pair's, so its two lobes stand apart
    // and a press on one is not inside the other's circle as well.
    cannonCol: 2,
    hullMilli: 100_000,
    scars: [],
    verdict: 0,
    verdictCol: -1,
    holdThumbs: 0,
    holdBeat: -1,
    ...overrides,
  };
}

export const hold = (overrides: Partial<MirrorState> = {}) =>
  mirror({ phase: "hold", ...overrides });
