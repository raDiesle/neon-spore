import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GeodeStep,
  PLAY_CHARGE,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
} from "@neon-spore/sim";
import { geodeHand } from "../src/boss-hands-geode.js";

/**
 * **AUTO beats THE GEODE, level by level** (`boss-hands-geode.ts`): every
 * crack burnt by a beam in its colour, the stacked pair by one beam, the
 * heart's two without the cannon moving — and no piece ever lands on the hull.
 */

/** The shipped wave's script, written out: hands tests do not read content. */
const SCRIPT: readonly GeodeStep[] = [
  { beats: 20, cracks: [{ at: 2, color: "red" }] },
  {
    beats: 24,
    cracks: [
      { at: -3, color: "cyan" },
      { at: 3, color: "red" },
    ],
  },
  {
    beats: 28,
    cracks: [
      { at: -4, color: "red" },
      { at: 0, color: "cyan" },
      { at: 0, color: "cyan" },
      { at: 4, color: "red" },
    ],
  },
  {
    beats: 22,
    cracks: [
      { at: -1, color: "red" },
      { at: -1, color: "cyan" },
    ],
  },
];

function played(charge: Partial<typeof DEFAULT_CONFIG>): SimEvent[] {
  const cfg = { ...DEFAULT_CONFIG, ...charge };
  const world = createWorld(cfg, 1);
  startWave(world, 0, [], [], { kind: "geode", steps: SCRIPT });
  const heard: SimEvent[] = [];
  const stop = 400 * ticksPerBeat(cfg);
  while (world.tick < stop && world.boss !== null) {
    step(
      world,
      geodeHand(world).map((c) => ({ ...c, tick: world.tick })),
    );
    heard.push(...world.events);
  }
  return heard;
}

describe("THE GEODE, played by AUTO", () => {
  it.each([
    ["no grid", {}],
    ["the game's half-beat grid", PLAY_CHARGE],
  ])("burns every crack and shatters the heart on %s", (_name, charge) => {
    const heard = played(charge);
    const types = heard.map((e) => e.type);
    const count = (t: string) => types.filter((h) => h === t).length;
    expect(count("geodeCleave")).toBe(9);
    expect(count("geodeSplit")).toBe(4);
    // Nine pieces, eight beams: the stacked pair went to one.
    expect(heard.filter((e) => e.type === "fire" && e.lance).length).toBe(8);
    expect(types).not.toContain("geodeStrike");
    expect(types).not.toContain("geodeWrong");
    expect(types).toContain("geodeShatter");
    expect(types).toContain("geodeOut");
  });
});
