import { beatSeconds, type CystState, type World } from "@neon-spore/sim";
import { HUSH, IDLE_DRIFT, subSeed } from "./idle-drift.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE CYST's lobes swing about their waists** (`docs/spec/living-bosses.md`
 * §1, the outline tier; the part map's "each of its four lobes"): each lobe
 * turns about the sac's middle by its own angle, all of it at the tip and none
 * at the waists it parts from its neighbours at (`cystBent`), so the four
 * sway out of step like the lobes of something floating, and the ring never
 * tears. A tip moves by more than half a tile, which is seen (*Big enough to
 * be seen*, `docs/looks.md`).
 *
 * **Nothing pressed moves.** The core, the freeze marks, the bud and the pinch
 * zones stand where they stood; a bolt is stopped on the lobes as they are
 * drawn (`cystStopper` reads `cystLobes`).
 *
 * **Every lit step but a shot opens THE SLOW** (`cyst-step.ts`), and inside
 * it the flanks and the spit lobe are the step — a shudder, a pinch, a bulge
 * — so they go still as it opens; the top lobe, which nothing is asked of,
 * keeps a third. Still through the split.
 */

/** How far a lobe swings at the widest, in radians: its tip, 1.7 tiles out, moves most of a tile. */
export const CYST_SWING = 0.4;
/** The lobe nothing is ever asked of: the top one, right, down, left, up. */
const UP = 3;

/** Each lobe's swing at `beat` and `beatPhase`, right first and on round. */
export function cystSwing(
  world: World,
  s: CystState,
  beat: number,
  beatPhase: number,
): [number, number, number, number] {
  const k = outlineDrift("cyst");
  if (k <= 0 || s.phase === "split") return [0, 0, 0, 0];
  const t = ((beat + beatPhase) * beatSeconds(world.cfg) * 2) / IDLE_DRIFT.roll.period;
  const one = (i: number) =>
    k *
    CYST_SWING *
    slowHush(world, beat, beatPhase, i === UP ? HUSH.marks : 0) *
    noise1(t, subSeed(OUTLINE_SEED.cyst, i));
  return [one(0), one(1), one(2), one(3)];
}
