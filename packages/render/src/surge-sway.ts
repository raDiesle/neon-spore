import { beatSeconds, type SimConfig, type SurgeState } from "@neon-spore/sim";
import { IDLE_DRIFT } from "./idle-drift.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { NO_SPAN, type SlowSpan, slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";
import { surgeEvert01 } from "./surge-shape.js";

/**
 * **THE SURGE rocks where it hangs** (`docs/spec/living-bosses.md` §1, the
 * outline tier), a lantern on a still night: the bulb rolls about its own
 * middle, one flank lifting as the other dips by more than half a tile, which
 * is seen (*Big enough to be seen*, `docs/looks.md`).
 *
 * **It never leaves its columns.** What it takes in and what it throws are
 * judged on its row and its columns (`surgeCovers`), so it does not slide or
 * bob; a roll about the middle keeps the bulb over the same three columns.
 * The press is anywhere on the bulb, a circle about that middle, which a
 * roll does not move. The two grip marks ride the flanks, and every reader of
 * them is handed the same roll (`surgeGripCircle`).
 *
 * **The seam rolls with it**, the gauge drawn along it, so both screens see
 * the same tilt: the clock is the beat. It eases out as the bulb everts, the
 * fold being the readout, and dies down under THE SLOW, which is shown while
 * the pair judge a near band.
 */

/** How far the bulb rolls at the widest, in radians: its flanks, 1.35 tiles out, lift and dip by over half a tile. */
export const SURGE_ROLL = 0.5;

/** The bulb's roll at `beat` and `beatPhase`, in radians, clockwise on the screen. */
export function surgeRoll(
  cfg: SimConfig,
  s: SurgeState,
  beat: number,
  beatPhase: number,
  slow: SlowSpan = NO_SPAN,
): number {
  const k = outlineDrift("surge");
  if (k <= 0 || s.outBeat >= 0) return 0;
  const left = (1 - surgeEvert01(s, cfg, beat, beatPhase)) * slowHush(slow, beat, beatPhase);
  if (left <= 0) return 0;
  const seconds = (beat + beatPhase) * beatSeconds(cfg);
  return k * left * SURGE_ROLL * noise1((seconds * 2) / IDLE_DRIFT.roll.period, OUTLINE_SEED.surge);
}
