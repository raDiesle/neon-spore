import type { BossKind } from "./boss-strike.js";
import type { CoreVerdict } from "./core-verdict.js";
import { GRINDSTONE_ROW_MILLI, grindstoneVerdict } from "./grindstone-shot.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **A boss's core is met where it hangs**, not where the bolt leaves the top
 * of the field. The owner, 5 October 2026: *the shot should hit it and then
 * have destroying animation, not fly through the boss, so it's visible the
 * shot hit and took effect immediately it hit the right location.* The
 * picture already drew the bolt stopping on the core (`render/bolt-stop.ts`);
 * the judgment waited for the bolt to climb the rest of the field, and the
 * step lit, the boss shook and the next one asked a fifth of a beat late.
 *
 * One row per boss, in the field's thousandths of a row — the core's centre,
 * which its picture is laid off too — beside the verdict its shot already
 * has. A bolt that `bullets.ts` sweeps across it, in a column the verdict
 * says anything of, is judged there by the same calls as at the top
 * (`shotLeaves`) and goes no further. A column the verdict is silent on
 * flies on to the top as it always did. The beam is not asked: it stands in
 * the whole column on the tick it lights, so it has nothing to be late for.
 */

interface Core {
  /** The core's centre, thousandths of a row down the field. */
  milli: number;
  verdict: (world: World, col: number, color: Color) => CoreVerdict;
}

const CORES: Partial<Record<BossKind, Core>> = {
  grindstone: { milli: GRINDSTONE_ROW_MILLI, verdict: grindstoneVerdict },
};

/**
 * How far past a core's centre the bolt is met, thousandths of a row: beyond
 * its far rim, so the picture has a frame of the bolt bursting on its near one
 * before the bolt is taken off the field.
 */
const MEET_MILLI = 500;

/** Where a bolt sweeping from `from` to `to` meets the boss's core, or -1. */
export function coreAlong(world: World, b: Bullet, from: number, to: number): number {
  const kind = world.boss?.kind;
  const core = kind === undefined ? undefined : CORES[kind];
  if (core === undefined || b.lance) return -1;
  const meet = core.milli - MEET_MILLI;
  if (meet > from || meet < to) return -1;
  return core.verdict(world, b.col, b.color) === null ? -1 : meet;
}
