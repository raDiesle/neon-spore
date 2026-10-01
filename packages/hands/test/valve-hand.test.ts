import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { valveHand } from "../src/boss-hands-valve.js";

/**
 * **AUTO plays THE VALVE to its open face** (`boss-hands-valve.ts`). It lost
 * the wave to its first spark until 1 October 2026: the game lays a press on
 * the next half beat (`shotChargeBeats`), and a spark counted from the beat
 * it leaked on, two beats long, could run out before a bolt fired on the
 * spark's own tick reached the top. `valveSparkBeats` is three now, so the
 * shortest a spark ever gets is longer than the lay and the bolt's climb.
 */

function played(shotChargeBeats: number): SimEvent[] {
  const cfg = { ...DEFAULT_CONFIG, shotChargeBeats };
  const world = createWorld(cfg, 1);
  startWave(world, 0, [], [], { kind: "valve", marks: [250, 600, 850] });
  const heard: SimEvent[] = [];
  const stop = 200 * ticksPerBeat(cfg);
  while (world.tick < stop && world.boss !== null) {
    step(
      world,
      valveHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return heard;
}

describe("THE VALVE, played by AUTO", () => {
  it.each([
    ["the game's half-beat grid", 0.5],
    ["no grid", 0],
  ])("shoots out both sparks and opens the face on %s", (_name, charge) => {
    const heard = played(charge).map((e) => e.type);
    expect(heard.filter((t) => t === "valveSparkOut")).toHaveLength(2);
    expect(heard).not.toContain("valveSparkHit");
    expect(heard).not.toContain("waveFailed");
    expect(heard).toContain("valveOut");
  });

  it("leaves a spark at least the lay and the climb of a bolt", () => {
    const cfg = { ...DEFAULT_CONFIG, shotChargeBeats: 0.5 };
    const beat = ticksPerBeat(cfg);
    const shortest = (cfg.valveSparkBeats - 1) * beat;
    // The whole field, top to bottom, at `bulletTilesPerBeat`.
    const climb = Math.ceil((cfg.rows / cfg.bulletTilesPerBeat) * beat);
    expect(shortest).toBeGreaterThan(cfg.shotChargeBeats * beat + climb);
  });
});
