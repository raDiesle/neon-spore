import { describe, expect, it } from "bun:test";
import {
  type ChrysalisStep,
  createWorld,
  DEFAULT_CONFIG,
  PLAY_CHARGE,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { chrysalisHand } from "../src/boss-hands-chrysalis.js";

/**
 * **AUTO peels THE CHRYSALIS, skin by skin** (`boss-hands-chrysalis.ts`):
 * both halves of the slime rubbed clear, every quill ripped, straight or
 * round its curve, every sac burst on the shield, the heart shot in its
 * colour at every beat — and no skin ever grows back.
 */

/** The shipped wave's script, written out: hands tests do not read content. */
const SCRIPT: readonly ChrysalisStep[] = [
  { skin: "slime", rubs: 6, beats: 32 },
  { skin: "slime", rubs: 10, beats: 40 },
  { skin: "quills", beats: 36 },
  { skin: "quills", tracks: ["sweep", "sweep", "snake", "climb"], beats: 48 },
  { skin: "sacs", offsets: [-2, 1, 0, 2], beats: 40 },
  { skin: "sacs", offsets: [1, -1, 2, -2, 0], beats: 48 },
  { skin: "heart", offsets: [-1, 2, 0], colors: ["red", "cyan", "red"], beats: 32 },
  { skin: "heart", offsets: [2, -2, 1, -1], colors: ["cyan", "red", "red", "cyan"], beats: 40 },
];

function played(charge: Partial<typeof DEFAULT_CONFIG>): SimEvent[] {
  const cfg = { ...DEFAULT_CONFIG, ...charge };
  const world = createWorld(cfg, 1);
  startWave(world, 0, [], [], { kind: "chrysalis", steps: SCRIPT });
  const heard: SimEvent[] = [];
  const stop = 600 * ticksPerBeat(cfg);
  while (world.tick < stop && world.boss !== null) {
    step(
      world,
      chrysalisHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return heard;
}

describe("THE CHRYSALIS, played by AUTO", () => {
  it.each([
    ["no grid", {}],
    ["the game's half-beat grid", PLAY_CHARGE],
  ])("peels every skin and kills the grub on %s", (_name, charge) => {
    const heard = played(charge).map((e) => e.type);
    const count = (t: string) => heard.filter((h) => h === t).length;
    expect(count("chrysalisWipe")).toBe(4);
    expect(count("chrysalisRip")).toBe(16);
    expect(count("chrysalisBurst")).toBe(9);
    expect(count("chrysalisHeart")).toBe(7);
    expect(count("chrysalisShed")).toBe(8);
    expect(heard).not.toContain("chrysalisRegrow");
    expect(heard).not.toContain("chrysalisSnap");
    expect(heard).not.toContain("chrysalisWrong");
    expect(heard).toContain("chrysalisOut");
  });
});
