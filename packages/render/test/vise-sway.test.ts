import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  ticksPerBeat,
  type ViseState,
  viseBoss,
  type World,
} from "@neon-spore/sim";
import { HUSH } from "../src/idle-drift.js";
import { computeLayout } from "../src/layout.js";
import { NO_SPAN } from "../src/slow-hush.js";
import { viseLobeCircle } from "../src/vise-grip.js";
import { VISE_SWING, viseSwing } from "../src/vise-sway.js";

/**
 * THE VISE's swing (`vise-sway.ts`): the case's foot, two half-heights under
 * the hinge, wanders by more than half a tile each way and never past its
 * cap; it keeps a third while THE SLOW asks, and the lobe marks a thumb is
 * shown ride it; and it is still once it has split.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
/** The case's height, hinge to foot, in tiles (`vise-shape.ts` `RY`, twice). */
const HANG = 2 * 1.45;
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);

function stood(): { world: World; s: ViseState } {
  const world = createWorld(CFG, 5);
  const index = WAVES.findIndex((w) => w.boss?.kind === "vise");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  const s = viseBoss(world);
  if (s === null) throw new Error("the vise wave stood no case");
  world.slowFromBeat = NO_SPAN.slowFromBeat;
  world.slowToBeat = NO_SPAN.slowToBeat;
  return { world, s };
}

const swung = (world: World, s: ViseState) =>
  QUARTERS.map((q) => viseSwing(CFG, s, world.beat + Math.floor(q / 4), (q % 4) / 4, world));

describe("THE VISE's case swings from its hinge", () => {
  it("moves its foot by more than half a tile each way, and never past its cap", () => {
    const { world, s } = stood();
    const foot = swung(world, s).map((a) => HANG * Math.sin(a));
    expect(Math.max(...foot)).toBeGreaterThan(0.5);
    expect(Math.min(...foot)).toBeLessThan(-0.5);
    expect(Math.max(...swung(world, s).map(Math.abs))).toBeLessThanOrEqual(VISE_SWING);
  });

  it("carries the lobe mark a thumb is shown with it", () => {
    const { world, s } = stood();
    const xs = QUARTERS.map(
      (q) => viseLobeCircle(L, CFG, s, 1, world.beat + Math.floor(q / 4), (q % 4) / 4).x,
    );
    expect((Math.max(...xs) - Math.min(...xs)) / L.tile).toBeGreaterThan(0.5);
  });

  it("keeps a third while THE SLOW asks, and is still once it has split", () => {
    const { world, s } = stood();
    world.slowFromBeat = world.beat;
    world.slowToBeat = world.beat + 1000;
    const asked = QUARTERS.filter((q) => q >= 4).map((q) =>
      viseSwing(CFG, s, world.beat + Math.floor(q / 4), (q % 4) / 4, world),
    );
    expect(Math.max(...asked.map(Math.abs))).toBeLessThanOrEqual(VISE_SWING * HUSH.marks);
    expect(Math.max(...asked.map(Math.abs))).toBeGreaterThan(0);
    const open = stood();
    open.s.phase = "split";
    expect(Math.max(...swung(open.world, open.s).map(Math.abs))).toBe(0);
  });
});
