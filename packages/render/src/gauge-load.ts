import type { GaugeState } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";

/**
 * **Which colour THE GAUGE's cannon is loaded with** — cyan, then red, turn
 * about with every hit. The owner, 25 September 2026: *the regular cannon,
 * cyan or red … the wounds … mixed up with colour of cannon to hit*.
 *
 * A picture and not a rule. The call is still one comparison of two angles
 * (`sim/gauge.ts`); the colour is what ties the wound to the gun that opens
 * it, the way a red rock on the field is the one a red shot answers. It turns
 * over on each hit because a hit spends the wound and a fresh one tears open
 * somewhere else — the new colour says *new wound* on both screens at once.
 *
 * Read off `marks` alone, so both devices agree on it without being told and
 * nothing here outlives a frame.
 */
export type Loaded = "cyan" | "red";

/** The colour loaded after `marks` hits. */
export function loadedAfter(marks: number): Loaded {
  return marks % 2 === 0 ? "cyan" : "red";
}

/** What the cannon has in it now. */
export function gaugeLoaded(gauge: GaugeState): Loaded {
  return loadedAfter(gauge.marks);
}

/** The colour the last shot went out in: a hit has already counted itself. */
export function gaugeShotLoad(gauge: GaugeState): Loaded {
  return loadedAfter(gauge.calledGood ? gauge.marks - 1 : gauge.marks);
}

export interface LoadedLook {
  hex: string;
  rim: string;
  dark: string;
}

/** The ammunition's three, as the fire buttons and the shots wear them. */
export function loadedLook(load: Loaded): LoadedLook {
  return load === "red"
    ? { hex: PALETTE.red, rim: PALETTE.redRim, dark: PALETTE.redDark }
    : { hex: PALETTE.cyan, rim: PALETTE.cyanRim, dark: PALETTE.cyanDark };
}
