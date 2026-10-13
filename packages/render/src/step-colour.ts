import type { Color } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";

/**
 * **A boss step's colour on the canvas**: its cannon's fill and rim, or the
 * hull's rim for a step either cannon answers.
 *
 * THE SEAM wrote it first (§26, *Colour*) and THE OCULUS, THE VISE, THE CYST,
 * THE SLING and THE DAVIT each wrote it again beside their marks, word for
 * word; every boss that lights a step in a colour calls this instead, and
 * `packages/sim/test/copies-table.ts` fails on the next file that copies it.
 */
export function stepColour(color: Color | "either"): { body: string; rim: string } {
  if (color === "either") return { body: PALETTE.hullRim, rim: PALETTE.hullRim };
  return { body: PALETTE[color], rim: color === "red" ? PALETTE.redRim : PALETTE.cyanRim };
}

/**
 * **The cannon a lit step names, for a `FIRE`'s `shows`** — none for a step
 * either cannon answers. A step is lit in its colour on both screens, so the
 * fire button of that colour wears the mark too (`fire-button-mark.ts`).
 */
export function stepShows(color: Color | "either"): Color | undefined {
  return color === "either" ? undefined : color;
}
