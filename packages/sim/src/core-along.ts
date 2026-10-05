import type { BossKind } from "./boss-strike.js";
import { burgeeVerdict } from "./burgee-shot.js";
import { capstanVerdict } from "./capstan-shot.js";
import { midCol } from "./config.js";
import type { CoreVerdict } from "./core-verdict.js";
import { davitVerdict } from "./davit-shot.js";
import { flueVerdict } from "./flue-shot.js";
import { gallVerdict } from "./gall-shot.js";
import { governorVerdict } from "./governor-shot.js";
import { GRINDSTONE_ROW_MILLI, grindstoneVerdict } from "./grindstone-shot.js";
import { halterVerdict } from "./halter-shot.js";
import { rimeVerdict } from "./rime-shot.js";
import { slingVerdict } from "./sling-shot.js";
import { trivetVerdict } from "./trivet-shot.js";
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
 * One row per boss, in the field's thousandths of a row — the body's centre,
 * which its picture is laid off too — beside the verdict its shot already
 * has. A bolt that `bullets.ts` sweeps across it in the middle column, where
 * every core hangs, and that the verdict says anything of, is judged there by
 * the same calls as at the top (`shotLeaves`) and goes no further. Any other
 * column — a part a step asks for aside, or one the verdict is silent on —
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
  burgee: { milli: 550, verdict: burgeeVerdict },
  capstan: { milli: 2700, verdict: capstanVerdict },
  davit: { milli: 1100, verdict: davitVerdict },
  flue: { milli: 1900, verdict: flueVerdict },
  gall: { milli: 2900, verdict: gallVerdict },
  governor: { milli: 5900, verdict: governorVerdict },
  halter: { milli: 2100, verdict: halterVerdict },
  rime: { milli: 2200, verdict: rimeVerdict },
  sling: { milli: 1800, verdict: slingVerdict },
  trivet: { milli: 1700, verdict: trivetVerdict },
};

/**
 * The row boss `kind`'s body hangs at, thousandths of a row: what its picture
 * stands it at (`render/*-shape.ts`), so the two cannot drift apart.
 */
export function coreRowMilli(kind: BossKind): number {
  const core = CORES[kind];
  if (core === undefined) throw new Error(`${kind} has no core met where it hangs`);
  return core.milli;
}

/** The bosses on the table, for the test that plays each (`render/test/core-met.test.ts`). */
export const CORE_KINDS = Object.keys(CORES) as BossKind[];

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
  if (core === undefined || b.lance || b.col !== midCol(world.cfg)) return -1;
  const meet = core.milli - MEET_MILLI;
  if (meet > from || meet < to) return -1;
  return core.verdict(world, b.col, b.color) === null ? -1 : meet;
}
