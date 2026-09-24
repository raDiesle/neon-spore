import { describe, expect, it } from "bun:test";
import { candleFlash, candleStruck } from "../src/candle-step.js";
import {
  type CandleState,
  candleBoss,
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  slowing,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE CANDLE doubled (`docs/spec/choreographed-windows.md`, 24 September
 * 2026): the smoke twelve beats and the pull three tiles — and **THE SLOW
 * moved to the ask**, which is the smoke: opened by the pull for exactly
 * `candleSmokeBeats` and shut the tick the beam puts the wick out or the wick
 * lights again (`candle-hand.ts`, `candle-step.ts`). A flash keeps its own
 * one-beat slow everywhere but the smoke, which it would cut short. The last
 * step is `candle-wick.test.ts`.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function glow(world: World): CandleState {
  const c = candleBoss(world);
  if (c === null) throw new Error("no glow installed");
  return c;
}

function shot(world: World, col: number, color: Color = "red", lance = false): Bullet {
  return { id: world.nextId++, col, row: 0, subMilli: 0, color, lance, driftMilli: 0, aimMilli: 0 };
}

/** The last glow, then the pilot's thumb carried all the way down: smoking. */
function smoking(): World {
  const world = createWorld(CFG, 3);
  startWave(world, 6, [], [], { kind: "candle" });
  for (let i = 0; i < (CFG.candleDarkBeats + 1) * TPB; i++) step(world, []);
  for (let i = 0; i < CFG.candleGlowSteps - CFG.candleLastSteps; i++) {
    candleStruck(world, shot(world, glow(world).col));
  }
  // Past any flash window the hits above might have left.
  for (let i = 0; i < 2 * TPB; i++) step(world, []);
  expect(slowing(world)).toBe(false);
  const pull = { kind: "drag", target: "candleWick", on: true, fromMilli: 0 } as const;
  step(world, [
    { tick: world.tick, player: 1, command: { ...pull, fromYMilli: CFG.candlePinchMilli - 1 } },
  ]);
  expect(glow(world).phase).toBe("last");
  step(world, [
    { tick: world.tick, player: 1, command: { ...pull, fromYMilli: CFG.candlePinchMilli } },
  ]);
  expect(glow(world).phase).toBe("smoking");
  return world;
}

describe("THE CANDLE, doubled", () => {
  it("asks three tiles of the thumb and gives the beam twelve beats", () => {
    expect(CFG.candlePinchMilli).toBe(3000);
    expect(CFG.candleSmokeBeats).toBe(12);
  });

  it("slows the smoke for exactly its beats from the pull", () => {
    const world = smoking();
    expect(slowing(world)).toBe(true);
    expect(world.slowToBeat).toBe(glow(world).phaseBeat + CFG.candleSmokeBeats);
  });

  it("keeps the smoke's window whole through a flash", () => {
    const world = smoking();
    const to = world.slowToBeat;
    candleFlash(world);
    expect(world.slowToBeat).toBe(to);
  });

  it("shuts THE SLOW the tick the beam puts the wick out", () => {
    const world = smoking();
    candleStruck(world, shot(world, glow(world).col, "cyan", true));
    expect(glow(world).phase).toBe("out");
    expect(slowing(world)).toBe(false);
  });

  it("shuts THE SLOW with a wick that lights again", () => {
    const world = smoking();
    const c = glow(world);
    while (c.phase === "smoking") step(world, []);
    expect(world.beat).toBe(c.phaseBeat);
    expect(slowing(world)).toBe(false);
  });
});
