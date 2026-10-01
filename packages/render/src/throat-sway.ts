import { beatSeconds, type SimConfig } from "@neon-spore/sim";
import { IDLE_DRIFT, subSeed } from "./idle-drift.js";
import type { Layout } from "./layout.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE THROAT sways where it hangs free** (`docs/spec/living-bosses.md` §1,
 * the outline tier). A lean about one root, the tier's pose for a body with
 * one end (`outline-drift.ts`), would part the gullet from the mouth it
 * narrows to, so the throat bows instead: both ends held, the middle swung.
 * The root is fixed in the hull where the cannon would stand, and the top ring
 * stands under the mouth the navigator carries (`throatAimCircle`). Neither
 * sways, and the rings between swing most of a tile, which is seen (*Big
 * enough to be seen*, `docs/looks.md`).
 *
 * Two shapes on two wanders from the throat's own seed: a bow, widest in
 * the middle, on the idle drift's roll row, and an S that bends the upper
 * and lower halves opposite ways, on its pitch row. Neither snaps, for
 * `idle-drift.ts`' reason.
 *
 * **Everything that reads a ring gets the swung ring** — the skin, the
 * captions round the gullet, THE SLOW's aim — because the sway
 * lives in `rings()` and there is no rest ring to read. That is why the clock
 * is the beat: a hit test has the beat and no frame time.
 */
export const THROAT_SWAY = {
  /** How far the middle of the gullet swings across at the widest, in tiles. */
  bow: 0.7,
  /** How far the S carries a ring a quarter of the way from either end, in tiles. */
  snake: 0.25,
} as const;

/**
 * How far across the ring `t` of the way from the root to the ring under the mouth is
 * swung, in pixels, at `beat` and `beatPhase`: 0 at both ends.
 */
export function throatSway(
  l: Layout,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
  t: number,
): number {
  const k = outlineDrift("throat");
  if (k <= 0) return 0;
  const seconds = (beat + beatPhase) * beatSeconds(cfg);
  const seed = OUTLINE_SEED.throat;
  const bow = noise1((seconds * 2) / IDLE_DRIFT.roll.period, subSeed(seed, 3));
  const snake = noise1((seconds * 2) / IDLE_DRIFT.pitch.period, subSeed(seed, 2));
  return (
    k *
    l.tile *
    (THROAT_SWAY.bow * bow * Math.sin(Math.PI * t) +
      THROAT_SWAY.snake * snake * Math.sin(2 * Math.PI * t))
  );
}
