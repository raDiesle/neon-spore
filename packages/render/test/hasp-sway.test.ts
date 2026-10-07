import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  HASP_COUNT,
  type HaspState,
  haspBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { HASP_SWING, haspSwing } from "../src/hasp-sway.js";
import { NO_SPAN } from "../src/slow-hush.js";

/**
 * THE HASP's spent clasps (`hasp-sway.ts`): a spent clasp's tail, 2.7 tiles
 * under its pin, swings by more than half a tile each way and never past its
 * cap; a sealed clasp is still; and the swing goes as the row clears.
 */

const CFG = DEFAULT_CONFIG;
/** The shell's length, pin to tail, in tiles (`hasp-shape.ts` `SHELL_RY`, twice). */
const LONG = 2 * 1.35;
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);

function row(): { world: World; s: HaspState } {
  const world = createWorld(CFG, 5);
  const index = WAVES.findIndex((w) => w.boss?.kind === "hasp");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 2; i++) step(world, []);
  const s = haspBoss(world);
  if (s === null) throw new Error("the hasp wave hung no row");
  world.slowFromBeat = NO_SPAN.slowFromBeat;
  world.slowToBeat = NO_SPAN.slowToBeat;
  s.hasps = HASP_COUNT - 1;
  return { world, s };
}

const tails = (world: World, s: HaspState, i: number) =>
  QUARTERS.map(
    (q) => LONG * Math.sin(haspSwing(world, s, i, world.beat + Math.floor(q / 4), (q % 4) / 4)),
  );

describe("a spent clasp of THE HASP swings on its hinge", () => {
  it("swings its tail by more than half a tile each way, and never past its cap", () => {
    const { world, s } = row();
    const x = tails(world, s, 0);
    expect(Math.max(...x)).toBeGreaterThan(0.5);
    expect(Math.min(...x)).toBeLessThan(-0.5);
    expect(Math.max(...x.map(Math.abs))).toBeLessThanOrEqual(LONG * Math.sin(HASP_SWING));
  });

  it("holds a sealed clasp still, and every clasp once the row has cleared", () => {
    const { world, s } = row();
    expect(Math.max(...tails(world, s, 1).map(Math.abs))).toBe(0);
    s.phase = "clear";
    s.phaseBeat = world.beat - 100;
    expect(Math.max(...tails(world, s, 0).map(Math.abs))).toBe(0);
  });
});
