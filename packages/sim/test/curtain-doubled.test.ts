import { describe, expect, it } from "bun:test";
import { curtainStruck } from "../src/curtain-shot.js";
import {
  type CurtainState,
  createWorld,
  curtainBoss,
  curtainCoreBare,
  DEFAULT_CONFIG,
  type SimConfig,
  slowing,
  startWave,
  step,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE CURTAIN doubled (`docs/spec/choreographed-windows.md`, 24 September
 * 2026): a soft set of `curtainSoftCount` three for twelve beats, a jam of
 * twelve with the hem carried twice as far — and **THE SLOW over the jam
 * exactly**, opened by the hit that jams the rail and shut by the next hit or
 * by the jam running out (`curtain-shot.ts`, `curtain-step.ts`). The fight is
 * `curtain.test.ts` and the hem `curtain-hem.test.ts`.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG, hullInvulnerable: true };

function install(): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "curtain" });
  return world;
}

function curtain(world: World): CurtainState {
  const c = curtainBoss(world);
  if (c === null) throw new Error("the wave installed no curtain");
  return c;
}

function shot(world: World, col: number, color: Color): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color,
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

/** The sheet carried clear of the core by hand, and a bolt of its colour up the column. */
function jam(world: World): CurtainState {
  const c = curtain(world);
  const body = world.creatures.find((b) => b.id === c.creatureId);
  if (body === undefined) throw new Error("no fabric");
  body.col = c.coreCol + 1;
  expect(curtainCoreBare(world, c)).toBe(true);
  curtainStruck(world, shot(world, c.coreCol, c.coreColor));
  expect(c.phase).toBe("pinned");
  return c;
}

describe("THE CURTAIN, doubled", () => {
  it("draws three soft lobes and asks nothing slowly of them", () => {
    const world = install();
    expect(curtain(world).soft).toHaveLength(CFG.curtainSoftCount);
    expect(CFG.curtainSoftCount).toBe(3);
    expect(slowing(world)).toBe(false);
  });

  it("slows the jam for exactly its beats from the hit", () => {
    const world = install();
    const c = jam(world);
    expect(slowing(world)).toBe(true);
    expect(world.slowToBeat).toBe(c.phaseBeat + CFG.curtainPinBeats);
  });

  it("shuts THE SLOW the tick the jam is answered by a hit under the lifted hem", () => {
    const world = install();
    const c = jam(world);
    c.liftMilli = CFG.curtainLiftMilli;
    expect(curtainCoreBare(world, c)).toBe(true);
    curtainStruck(world, shot(world, c.coreCol, c.coreColor));
    expect(c.coreHits).toBe(2);
    expect(slowing(world)).toBe(false);
  });

  it("shuts THE SLOW with a jam that ran out unanswered", () => {
    const world = install();
    const c = jam(world);
    while (c.phase === "pinned") step(world, []);
    expect(c.phase).toBe("hung");
    expect(world.beat).toBe(c.phaseBeat);
    expect(slowing(world)).toBe(false);
  });
});
