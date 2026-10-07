import { describe, expect, it } from "bun:test";
import { buildBoss, buildQueue, WAVES } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type MantleState,
  mantleBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { mantleCentre, mantleTieY } from "../src/mantle-shape.js";
import { MANTLE_LEAN, mantleLean, mantleLeaned } from "../src/mantle-sway.js";
import { NO_SPAN } from "../src/slow-hush.js";

/**
 * THE MANTLE's lean (`mantle-sway.ts`): the nose wanders by more than half a
 * tile each way and never past its cap, the ties the knobs hang from do not
 * move, and the lean goes as the valves swing open.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q);

function hung(): { world: World; s: MantleState } {
  const world = createWorld(CFG, 5);
  const index = WAVES.findIndex((w) => w.boss?.kind === "mantle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  const s = mantleBoss(world);
  if (s === null) throw new Error("the mantle wave hung no shell");
  world.slowFromBeat = NO_SPAN.slowFromBeat;
  world.slowToBeat = NO_SPAN.slowToBeat;
  return { world, s };
}

const leans = (world: World, s: MantleState) =>
  QUARTERS.map((q) => mantleLean(world, s, world.beat + Math.floor(q / 4), (q % 4) / 4));

describe("THE MANTLE leans on its straps", () => {
  it("moves its nose by more than half a tile each way, and never past its cap", () => {
    const { world, s } = hung();
    const at = mantleCentre(L, CFG);
    const nose = { x: at.x, y: at.y - 2.3 * L.tile };
    const xs = leans(world, s).map((k) => (mantleLeaned(L, at, nose, k).x - nose.x) / L.tile);
    expect(Math.max(...xs)).toBeGreaterThan(0.5);
    expect(Math.min(...xs)).toBeLessThan(-0.5);
    expect(Math.max(...xs.map(Math.abs))).toBeLessThanOrEqual(MANTLE_LEAN + 1e-9);
  });

  it("leaves the ties where they hang", () => {
    const { world, s } = hung();
    const at = mantleCentre(L, CFG);
    const tie = { x: at.x + 2 * L.tile, y: mantleTieY(L, at) };
    for (const k of leans(world, s)) expect(mantleLeaned(L, at, tie, k).x).toBe(tie.x);
  });

  it("is still once the shell is split", () => {
    const { world, s } = hung();
    s.phase = "heartbeat";
    s.phaseBeat = world.beat - 8;
    expect(Math.max(...leans(world, s).map(Math.abs))).toBe(0);
  });
});
