import { describe, expect, setDefaultTimeout, test } from "bun:test";
import { controlSet, WAVES } from "@neon-spore/content";
import { computeLayout, type Viewport } from "@neon-spore/render";
import { type BossKind, beatPhase, repriseClock, step, type World } from "@neon-spore/sim";
import { repriseBox } from "../../../packages/render/src/reprise-draw.js";
import {
  type Box,
  bodyBox,
  FUSE_OVER_HULL,
  fuseAt,
  fuseBox,
  liveMarks,
  underAim,
  underBox,
} from "../../../packages/render/src/slow-fuse-place.js";
import { aim } from "../../../packages/render/src/slow-intake-aim.js";
import { slowWindow } from "../../../packages/render/src/slow-look.js";
import { cpuTimeout } from "../../test/cpu-time.js";
import { bossWorld } from "../src/poses-bosses-kit.js";
import { stageAutopilot } from "../src/stage-autopilot.js";
import { stageField } from "../src/stage-field.js";

/**
 * **The fuse stands under the boss, above the hull, and over no mark** — the
 * owner, 27 September 2026: *below the boss and between the ship hull*.
 *
 * AUTO plays both seats through every boss wave, and on every tick a window
 * that asks is open the fuse is placed as the game places it
 * (`slow-intake.ts`), and its box is held against the body's box
 * (`slow-intake-aim.ts`), the hull, and the ring of every mark asking for a
 * thumb that tick (`slow-fuse-place.ts` `liveMarks`). THE REPRISE counts its
 * own clock rather than a window and is walked the same way under its sac.
 *
 * A body that comes within a fuse's height of the hull leaves no gap, and the
 * fuse drops onto the hull — or walks up off it, clear of a ring standing
 * there: that is the one place it may stand beside the body rather than under
 * it. THE UNDERTOW is that boss. A boss THE SLOW's aim has no row for falls
 * back to the cannon on the hull and would be excused the same way, which is
 * how five bosses hid there until page four (`slow-boss-aim-d.ts`) gave them
 * rows: those five must now be walked, and leave a gap on every tick. Every
 * window must still be walked by somebody: THE INSTAR's, at least, and THE
 * REPRISE's clock.
 */

// Forty thousand ticks of a wave with AUTO on both seats; the slowest idle is
// about a second.
setDefaultTimeout(cpuTimeout(1_500));

const VIEWPORT: Viewport = { width: 900, height: 1600, dpr: 2 };
const TICKS = 40_000;

const KINDS = [
  ...new Set(WAVES.flatMap((w) => (w.boss === undefined ? [] : [w.boss.kind as BossKind]))),
];

const crosses = (a: Box, b: Box): boolean =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/** The bosses that must be walked, and the ones that must leave a gap on every tick. */
const GAPPED: readonly string[] = ["seam", "halter", "capstan", "gall", "burgee"];
const WALKED: readonly string[] = ["instar", "reprise", ...GAPPED];

interface Walked {
  ticks: number;
  gapped: number;
  wrong: string[];
}

function walk(kind: BossKind): Walked {
  const world = bossWorld(kind);
  const cfg = world.cfg;
  const l = computeLayout(VIEWPORT, cfg, "test");
  const field = (seat: 1 | 2) => stageField(world, "test", controlSet("default"), cfg, seat, null);
  const auto = stageAutopilot({ layout: () => l, field });
  auto.setMode("both");
  const wrong: string[] = [];
  let ticks = 0;
  let gapped = 0;
  for (let i = 0; i < TICKS && world.boss?.kind === kind; i++) {
    step(world, auto.commands(world));
    const bp = beatPhase(cfg, world.tick);
    const m = measured(world, l, bp);
    if (m === null) continue;
    ticks++;
    const { body, under } = m;
    const box = fuseBox(l, fuseAt(l, world, bp, under));
    const at = `${kind} at tick ${world.tick}`;
    const gap = l.hullY - FUSE_OVER_HULL - body.bottom >= box.bottom - box.top;
    if (gap) gapped++;
    if (box.bottom > l.hullY) wrong.push(`${at}: below the hull`);
    if (gap && box.top < body.bottom) wrong.push(`${at}: not under the body`);
    if (liveMarks(l, world, bp).some((m) => crosses(box, m))) wrong.push(`${at}: over a mark`);
  }
  return { ticks, gapped, wrong };
}

/** The body's whole box this tick, and the part the fuse stands under, or
 * `null` on a tick no fuse is drawn. */
function measured(
  world: World,
  l: ReturnType<typeof computeLayout>,
  bp: number,
): { body: Box; under: ReturnType<typeof underAim> } | null {
  if (world.boss?.kind === "reprise") {
    if (repriseClock(world) === null) return null;
    const body = repriseBox(l, world.cfg);
    return { body, under: underBox(body) };
  }
  if (slowWindow(world, bp)?.asks !== true) return null;
  const at = aim(world, l, world.beat, bp);
  return { body: bodyBox(at), under: underAim(at) };
}

describe("the fuse stands under the boss, above the hull, and over no mark", () => {
  test.each(KINDS)("%s", (kind) => {
    const { ticks, gapped, wrong } = walk(kind);
    expect(wrong.slice(0, 5)).toEqual([]);
    if (WALKED.includes(kind)) expect(ticks).toBeGreaterThan(0);
    if (GAPPED.includes(kind)) expect(gapped).toBe(ticks);
  });
});
