import { beatSeconds, type SimConfig, type ViseState, viseDone } from "@neon-spore/sim";
import { HUSH, IDLE_DRIFT } from "./idle-drift.js";
import type { Layout } from "./layout.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { NO_SPAN, type SlowSpan, slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";
import { type Point, viseHinge } from "./vise-shape.js";
import { viseBite } from "./vise-story.js";

/**
 * **THE VISE's case swings from its hinge** (`docs/spec/living-bosses.md` §1,
 * the outline tier), a seed-pod on its stalk: both lobes and the spine turn
 * together about the hinge at the top, so the case's foot wanders across by
 * more than half a tile, which is seen (*Big enough to be seen*,
 * `docs/looks.md`). Both lobes turn by the same angle, so the gap between
 * them — how far the kernel is bared — does not change.
 *
 * **The kernel hangs where it is.** A shot at it goes up the middle column
 * and is judged there (`viseShotStanding`), so it stays over that column and
 * the shell swings round it; a bolt meets the lobes as drawn (`viseStopper`
 * reads the same leans).
 *
 * **Hushed while it asks.** Every lit step opens THE SLOW (`vise-step.ts`),
 * and a rest between steps is one beat, so a swing that stopped for each ask
 * would hardly be seen: it keeps a third (`HUSH.marks`), and the two marks on
 * the lobes ride it — every reader of them turns them by the same swing about
 * the same hinge (`viseSwung`). Clamped shut through a bite, still through
 * the split.
 */

/** How far the case swings at the widest, in radians: its foot, 2.9 tiles under the hinge, moves most of a tile. */
export const VISE_SWING = 0.24;

/** The case's swing at `beat` and `beatPhase`, in radians, clockwise on the screen. */
export function viseSwing(
  cfg: SimConfig,
  s: ViseState,
  beat: number,
  beatPhase: number,
  slow: SlowSpan = NO_SPAN,
): number {
  const k = outlineDrift("vise");
  if (k <= 0 || viseDone(s)) return 0;
  const hush = slowHush(slow, beat, beatPhase, HUSH.marks);
  const left = (1 - viseBite(s, cfg, beat, beatPhase)) * hush;
  if (left <= 0) return 0;
  const seconds = (beat + beatPhase) * beatSeconds(cfg);
  return k * left * VISE_SWING * noise1((seconds * 2) / IDLE_DRIFT.roll.period, OUTLINE_SEED.vise);
}

/** Where `swing` puts `p`, a point in the case's frame, turned about the hinge as the lobes are. */
export function viseSwung<P extends Point>(l: Layout, p: P, swing: number): P {
  const hinge = viseHinge(l);
  const cos = Math.cos(swing);
  const sin = Math.sin(swing);
  const x = p.x - hinge.x;
  const y = p.y - hinge.y;
  return { ...p, x: hinge.x + x * cos - y * sin, y: hinge.y + x * sin + y * cos };
}
