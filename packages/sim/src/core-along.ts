import type { BossKind } from "./boss-strike.js";
import { capstanVerdict } from "./capstan-shot.js";
import { midCol } from "./config.js";
import type { CoreVerdict } from "./core-verdict.js";
import { curtainCoreAside, curtainVerdict } from "./curtain-shot.js";
import { cystBudAside, cystVerdict } from "./cyst-shot.js";
import { davitVerdict } from "./davit-shot.js";
import { gallVerdict } from "./gall-shot.js";
import { governorVerdict } from "./governor-shot.js";
import { grindstoneVerdict } from "./grindstone-shot.js";
import { halterVerdict } from "./halter-shot.js";
import { oculusVerdict } from "./oculus-shot.js";
import { plumbVerdict } from "./plumb-shot.js";
import { rimeVerdict } from "./rime-shot.js";
import { slingVerdict } from "./sling-shot.js";
import { stareVerdict } from "./stare-shot.js";
import { trivetVerdict } from "./trivet-shot.js";
import type { Bullet, Color } from "./types.js";
import { viseSeedAside, viseVerdict } from "./vise-shot.js";
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
 * nearly every core hangs, and that the verdict says anything of, is judged
 * there by the same calls as at the top (`shotLeaves`) and goes no further.
 * **A part met up a column of its own** is met the same way at its own row:
 * a part a step asks for aside — THE CYST's bud, THE VISE's seed — for as
 * long as that step is lit, and a core that hangs over a column of its own,
 * THE CURTAIN's, which drifts. Any other column, or one the verdict is silent
 * on, flies on to the top as it always did. The beam is not asked: it stands in
 * the whole column on the tick it lights, so it has nothing to be late for.
 */

interface Core {
  /** The core's centre in the middle column, thousandths of a row down the field; none where nothing hangs there. */
  milli?: number;
  /** Where a bolt is met, if not `MEET_MILLI` past the centre: a core that is not in the middle of its body. */
  meet?: number;
  verdict: (world: World, col: number, color: Color) => CoreVerdict;
  /** A part met up a column of its own, the column and row the world puts it at this tick, or null. */
  aside?: (world: World) => { col: number; milli: number } | null;
}

/**
 * Nothing imported is read while this module loads: it sits in a cycle with
 * the shots (`trapeze-shot` → … → `bullets` → here), and under Bun's HMR
 * runtime — the director's dev server — a module still loading is `null`, so
 * a verdict taken by name at load threw. Each is called through an arrow.
 */
const CORES: Partial<Record<BossKind, Core>> = {
  grindstone: { milli: 2000, verdict: (w, c, k) => grindstoneVerdict(w, c, k) },
  capstan: { milli: 2700, verdict: (w, c, k) => capstanVerdict(w, c, k) },
  curtain: { verdict: (w, c, k) => curtainVerdict(w, c, k), aside: (w) => curtainCoreAside(w) },
  cyst: {
    milli: 2200,
    verdict: (w, c, k) => cystVerdict(w, c, k),
    aside: (w) => cystBudAside(w),
  },
  davit: { milli: 1100, verdict: (w, c, k) => davitVerdict(w, c, k) },
  gall: { milli: 2900, verdict: (w, c, k) => gallVerdict(w, c, k) },
  // THE GOVERNOR's target is its needle's tip in the gap at the bottom of the
  // dial, four and a half rows under the hub, and a bolt is met past its far
  // edge (`governor-shot.ts`, `render/governor-shape.ts`).
  governor: { milli: 5900, meet: 9600, verdict: (w, c, k) => governorVerdict(w, c, k) },
  halter: { milli: 2100, verdict: (w, c, k) => halterVerdict(w, c, k) },
  oculus: { milli: 2200, verdict: (w, c, k) => oculusVerdict(w, c, k) },
  plumb: { milli: 2040, verdict: (w, c, k) => plumbVerdict(w, c, k) },
  rime: { milli: 2200, verdict: (w, c, k) => rimeVerdict(w, c, k) },
  sling: { milli: 1800, verdict: (w, c, k) => slingVerdict(w, c, k) },
  // THE STARE's eye hangs inside a glass dome reaching to row 2.9, and nothing
  // in it is ever a target: a bolt rings off the dome's lower edge, so it is
  // met just past that rather than past the eye (`render/stare-shell.ts`).
  stare: { milli: 1550, meet: 2400, verdict: (w, c, k) => stareVerdict(w, c, k) },
  trivet: { milli: 1700, verdict: (w, c, k) => trivetVerdict(w, c, k) },
  vise: {
    milli: 2200,
    verdict: (w, c, k) => viseVerdict(w, c, k),
    aside: (w) => viseSeedAside(w),
  },
  // THE SCUTTLE is left off on purpose, and its live part judged at the top,
  // four or five ticks after the bolt is drawn bursting on it: the frame
  // stands where the screen has room (`render/scuttle-shape.ts`'
  // `headroomDrop`), which the simulation cannot know. Laying it on a field
  // row would move it on tall screens, a look; decided 7 October 2026.
  // THE KEEL's socket and marrow lens are left off the same way: they stand
  // where the segments' pose puts them (`render/keel-marks.ts`,
  // `keel-story.ts`), hinged, breathing and swung, and a fixed row would
  // redraw the spine. Its thrown rock falls, and is met on its fall
  // (`keel-shot.ts`, `boss-along.ts`).
};

/**
 * The row boss `kind`'s body hangs at, thousandths of a row: what its picture
 * stands it at (`render/*-shape.ts`), so the two cannot drift apart.
 */
export function coreRowMilli(kind: BossKind): number {
  const milli = CORES[kind]?.milli;
  if (milli === undefined) throw new Error(`${kind} has no core met where it hangs`);
  return milli;
}

/** The bosses on the table, for the test that plays each (`render/test/core-met.test.ts`). */
export const CORE_KINDS = Object.keys(CORES) as BossKind[];

/**
 * How far past a core's centre the bolt is met, thousandths of a row: beyond
 * its far rim, so the picture has a frame of the bolt bursting on its near one
 * before the bolt is taken off the field.
 */
const MEET_MILLI = 500;

/** Where a bolt is met by boss `kind`'s core, thousandths of a row down the field. */
export function coreMeetMilli(kind: BossKind): number {
  return CORES[kind]?.meet ?? coreRowMilli(kind) - MEET_MILLI;
}

/** Where a bolt sweeping from `from` to `to` meets the boss's core, or -1. */
export function coreAlong(world: World, b: Bullet, from: number, to: number): number {
  const kind = world.boss?.kind;
  const core = kind === undefined ? undefined : CORES[kind];
  if (core === undefined || b.lance) return -1;
  const aside = core.aside?.(world);
  let meet = -1;
  if (aside?.col === b.col) meet = aside.milli - MEET_MILLI;
  else if (b.col === midCol(world.cfg) && core.milli !== undefined) {
    meet = core.meet ?? core.milli - MEET_MILLI;
  }
  if (meet < 0 || meet > from || meet < to) return -1;
  return core.verdict(world, b.col, b.color) === null ? -1 : meet;
}
