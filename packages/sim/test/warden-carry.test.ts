import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  WARDEN_PHASES,
  type WardenState,
  type World,
  wardenSwipeAlong,
} from "../src/index.js";

/**
 * **THE WARDEN's hatch keeps how far the thumb has carried it**
 * (`warden-hand.ts`, `hatchCarryMilli`), so the track can fill before the lift
 * (`render/warden-track.ts`): the furthest carry either way, signed, capped at
 * the throw, forgotten on the lift — and the lift is judged on it, so a thumb
 * that went the whole way and drifted back still throws.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const GLARE = WARDEN_PHASES[1]!.above;
const NEED = CFG.wardenThrowMilli;

function glare(): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, [], [], { kind: "warden", plates: GLARE });
  for (let t = 0; t < ticksPerBeat(CFG); t++) step(world, []);
  return world;
}

function hatch(world: World, player: 1 | 2, on: boolean, milli = 0): void {
  const c: TimedCommand = {
    tick: world.tick,
    player,
    command: { kind: "drag", target: "wardenHatch", on, fromMilli: milli, fromYMilli: 0 },
  };
  step(world, [c]);
}

function warden(world: World): WardenState {
  const b = world.boss;
  if (b === null || b.kind !== "warden") throw new Error("no warden");
  return b;
}

describe("THE WARDEN's hatch carry", () => {
  it("keeps the furthest carry either way, signed and capped at the throw", () => {
    const world = glare();
    hatch(world, 1, true);
    expect(warden(world).hatchCarryMilli).toBe(0);
    hatch(world, 1, true, -NEED / 2);
    expect(warden(world).hatchCarryMilli).toBe(-NEED / 2);
    expect(wardenSwipeAlong(world, warden(world))).toBe(-500);
    hatch(world, 1, true, -NEED / 4);
    expect(warden(world).hatchCarryMilli).toBe(-NEED / 2);
    hatch(world, 1, true, NEED * 3);
    expect(warden(world).hatchCarryMilli).toBe(NEED);
    expect(wardenSwipeAlong(world, warden(world))).toBe(1000);
  });

  it("throws on a lift after a full carry, wherever the lift itself is", () => {
    const world = glare();
    hatch(world, 1, true);
    hatch(world, 1, true, NEED);
    hatch(world, 1, false, 0);
    expect(world.events.some((e) => e.type === "wardenThrow")).toBe(true);
    expect(warden(world).hatchCarryMilli).toBe(0);
  });

  it("forgets a short carry on the lift, and refuses it", () => {
    const world = glare();
    hatch(world, 1, true, NEED - 1);
    hatch(world, 1, false, NEED - 1);
    expect(world.events.some((e) => e.type === "wardenRefuse")).toBe(true);
    expect(warden(world).hatchCarryMilli).toBe(0);
    expect(warden(world).throwBeat).toBe(-1);
  });

  it("takes no carry from the navigator's thumb", () => {
    const world = glare();
    hatch(world, 2, true, NEED);
    expect(warden(world).hatchCarryMilli).toBe(0);
  });

  it("is in the hash", () => {
    const a = glare();
    const b = glare();
    hatch(a, 1, true, NEED / 2);
    hatch(b, 1, true, 0);
    expect(warden(a).hatchCarryMilli).not.toBe(warden(b).hatchCarryMilli);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
