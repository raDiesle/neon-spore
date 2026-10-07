import { beatSeconds, type KeelState, keelDone, type SimConfig } from "@neon-spore/sim";
import { HUSH, IDLE_DRIFT } from "./idle-drift.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { NO_SPAN, type SlowSpan, slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE KEEL's loose segments heave on a swell** (`docs/spec/living-bosses.md`
 * §1, the outline tier): one gust runs along the spine, head to tail, and
 * each segment still loose rises and falls on it a moment after the one
 * before, by more than half a tile, which is seen (*Big enough to be seen*,
 * `docs/looks.md`). It goes on top of the rock each loose one already has
 * (`keelSegPose`), which is too small to be seen on its own.
 *
 * **A locked segment is rigid and does not heave**, so the spine stills a
 * joint at a time as the pair lock it — the progress drawn as a shape, which
 * the heave makes plainer. **Up and down only**: every segment stays over the
 * column a shot up to it is judged in.
 *
 * Every reader of a segment reads it through `keelSegs`, which adds the
 * heave, so the rings a thumb taps ride it. Each step opens THE SLOW, and the
 * heave keeps a third under it (`HUSH.marks`); the middle two still as they
 * hinge apart, and all of it once the spine is done.
 */

/** How far a loose segment heaves at the widest, in tiles. */
export const KEEL_HEAVE = 0.6;
/** Seconds the swell takes to pass from one segment to the next. */
const LAG = 0.3;

/** Segment `k`'s heave at `beat` and `beatPhase`, in tiles, down positive; `open` is how far the middle is hinged apart. */
export function keelHeave(
  cfg: SimConfig,
  s: KeelState,
  k: number,
  open: number,
  beat: number,
  beatPhase: number,
  slow: SlowSpan = NO_SPAN,
): number {
  const d = outlineDrift("keel");
  if (d <= 0 || s.locked[k] !== false || keelDone(s) || s.phase === "rigid") return 0;
  const left = (1 - open) * slowHush(slow, beat, beatPhase, HUSH.marks);
  if (left <= 0) return 0;
  const seconds = (beat + beatPhase) * beatSeconds(cfg) - k * LAG;
  return d * left * KEEL_HEAVE * noise1((seconds * 2) / IDLE_DRIFT.roll.period, OUTLINE_SEED.keel);
}
