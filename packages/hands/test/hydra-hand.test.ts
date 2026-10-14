import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type HydraStep,
  PLAY_CHARGE,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { hydraHand } from "../src/boss-hands-hydra.js";

/**
 * **AUTO beats THE HYDRA, level by level** (`boss-hands-hydra.ts`): every
 * neck cut the way its arrow points, every coil turned off, every eye tapped
 * while open, every maw quenched in its fire's colour — and no head ever
 * reaches the hull.
 */

/** The shipped wave's script, written out: hands tests do not read content. */
const SCRIPT: readonly HydraStep[] = [
  { head: "bite", count: 2, beats: 28 },
  { head: "bite", count: 3, ways: [-1, 1, -1], beats: 36 },
  { head: "coil", laps: 2, beats: 32 },
  { head: "coil", laps: 3, beats: 40 },
  { head: "eye", count: 4, beats: 36 },
  { head: "eye", count: 6, beats: 48 },
  { head: "maw", offsets: [-2, 1, 0], colors: ["red", "cyan", "red"], beats: 36 },
  { head: "maw", offsets: [2, -1, 1, -2], colors: ["cyan", "red", "cyan", "red"], beats: 44 },
];

function played(charge: Partial<typeof DEFAULT_CONFIG>): SimEvent[] {
  const cfg = { ...DEFAULT_CONFIG, ...charge };
  const world = createWorld(cfg, 1);
  startWave(world, 0, [], [], { kind: "hydra", steps: SCRIPT });
  const heard: SimEvent[] = [];
  const stop = 600 * ticksPerBeat(cfg);
  while (world.tick < stop && world.boss !== null) {
    step(
      world,
      hydraHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return heard;
}

describe("THE HYDRA, played by AUTO", () => {
  it.each([
    ["no grid", {}],
    ["the game's half-beat grid", PLAY_CHARGE],
  ])("stops every head and beats the hydra on %s", (_name, charge) => {
    const heard = played(charge).map((e) => e.type);
    const count = (t: string) => heard.filter((h) => h === t).length;
    expect(count("hydraCut")).toBe(10);
    expect(count("hydraUncoil")).toBe(4);
    expect(count("hydraPoke")).toBe(20);
    expect(count("hydraQuench")).toBe(7);
    expect(count("hydraCleared")).toBe(8);
    expect(heard).not.toContain("hydraStrike");
    expect(heard).not.toContain("hydraGlance");
    expect(heard).not.toContain("hydraMiss");
    expect(heard).not.toContain("hydraWrong");
    expect(heard).toContain("hydraOut");
  });
});
