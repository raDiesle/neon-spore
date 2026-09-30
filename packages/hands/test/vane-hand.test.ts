import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { vaneHand } from "../src/boss-hands-shots.js";

/**
 * **AUTO plays THE VANE through all four forms to its fall**
 * (`boss-hands-shots.ts`). Every form after the first turns guard arms across
 * the mouths (`sim/vane-guard.ts`), and a shot into one is a `reject` that
 * spends the opening; the hand waits for the gap instead, so the fight is won
 * without a shot refused, on the game's half-beat grid and on none.
 */

function played(shotChargeBeats: number): SimEvent[] {
  const cfg = { ...DEFAULT_CONFIG, shotChargeBeats };
  const world = createWorld(cfg, 1);
  startWave(world, 0, [], [], { kind: "vane" });
  const heard: SimEvent[] = [];
  const stop = 400 * ticksPerBeat(cfg);
  while (world.tick < stop && world.boss !== null) {
    step(
      world,
      vaneHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return heard;
}

describe("THE VANE, played by AUTO", () => {
  it.each([
    ["the game's half-beat grid", 0.5],
    ["no grid", 0],
  ])("takes every pin of every form on %s, and no shot is rejected", (_name, charge) => {
    const heard = played(charge);
    const count = (type: SimEvent["type"]) => heard.filter((e) => e.type === type).length;
    const cfg = DEFAULT_CONFIG;
    expect(count("vaneKnock")).toBe(cfg.vanePins + (cfg.vaneForms - 1) * cfg.vaneFormPins);
    expect(count("reject")).toBe(0);
  });
});
