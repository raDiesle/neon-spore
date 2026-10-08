import { describe, expect, it } from "bun:test";
import {
  type BastionStep,
  createWorld,
  DEFAULT_CONFIG,
  PLAY_CHARGE,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { bastionHand } from "../src/boss-hands-bastion.js";

/**
 * **AUTO takes THE BASTION apart, shell by shell** (`boss-hands-bastion.ts`):
 * every plate torn, every gun turned to the front and blown, every node burst
 * on the shield, every port shot — and no shell ever grows back.
 */

/** The shipped wave's script, written out: hands tests do not read content. */
const SCRIPT: readonly BastionStep[] = [
  { layer: "plates", beats: 32 },
  { layer: "ring", colors: ["red", "cyan", "red", "cyan", "red", "cyan"], beats: 40 },
  { layer: "lattice", offsets: [-2, 2, 0, -1, 1], beats: 48 },
  { layer: "port", offsets: [-2, 1, 0], beats: 32 },
];

function played(charge: Partial<typeof DEFAULT_CONFIG>): SimEvent[] {
  const cfg = { ...DEFAULT_CONFIG, ...charge };
  const world = createWorld(cfg, 1);
  startWave(world, 0, [], [], { kind: "bastion", steps: SCRIPT });
  const heard: SimEvent[] = [];
  const stop = 300 * ticksPerBeat(cfg);
  while (world.tick < stop && world.boss !== null) {
    step(
      world,
      bastionHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return heard;
}

describe("THE BASTION, played by AUTO", () => {
  it.each([
    ["no grid", {}],
    ["the game's half-beat grid", PLAY_CHARGE],
  ])("takes every shell off and blows the core on %s", (_name, charge) => {
    const heard = played(charge).map((e) => e.type);
    const count = (t: string) => heard.filter((h) => h === t).length;
    expect(count("bastionTear")).toBe(8);
    expect(count("bastionGun")).toBe(6);
    expect(count("bastionBurst")).toBe(5);
    expect(count("bastionPort")).toBe(3);
    expect(count("bastionShed")).toBe(4);
    expect(heard).not.toContain("bastionRegrow");
    expect(heard).not.toContain("bastionSnap");
    expect(heard).toContain("bastionOut");
  });
});
