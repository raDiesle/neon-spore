import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { wardenHand } from "../src/boss-hands-shots.js";

/**
 * **AUTO plays THE WARDEN to its fall, on the grid the game plays on**
 * (`boss-hands-shots.ts`). The game lays a shot on the half beat
 * (`shotChargeBeats`, `sim/shot-charge.ts`); `DEFAULT_CONFIG` does not. Aimed
 * at the pupil where it stood, every bolt of the game's arrived after the
 * pupil had walked on and was a `reject` on the rim, and `bun run frames
 * --auto both --until plate` found no plate in 3000 ticks — while the same
 * hand on the default config landed just in time. Led to where the pupil will
 * be (`sim/warden-lead.ts`), it takes every plate on either, and wastes not
 * one shot.
 */

function played(shotChargeBeats: number): SimEvent[] {
  const cfg = { ...DEFAULT_CONFIG, shotChargeBeats };
  const world = createWorld(cfg, 1);
  startWave(world, 0, [], [], { kind: "warden", plates: cfg.wardenPlates });
  const heard: SimEvent[] = [];
  const stop = 200 * ticksPerBeat(cfg);
  while (world.tick < stop && !heard.some((e) => e.type === "wardenDown")) {
    step(
      world,
      wardenHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return heard;
}

describe("THE WARDEN, played by AUTO", () => {
  it.each([
    ["the game's half-beat grid", 0.5],
    ["no grid", 0],
  ])("takes every plate on %s, and no shot is rejected", (_name, charge) => {
    const heard = played(charge);
    const count = (type: SimEvent["type"]) => heard.filter((e) => e.type === type).length;
    expect(count("wardenDown")).toBe(1);
    expect(count("plate")).toBe(DEFAULT_CONFIG.wardenPlates);
    expect(count("reject")).toBe(0);
    expect(count("fire")).toBe(DEFAULT_CONFIG.wardenPlates);
  });
});
