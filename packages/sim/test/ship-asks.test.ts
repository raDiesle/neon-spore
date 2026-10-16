import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type PodEntry,
  type SpawnEntry,
  shieldAsked,
  step,
  suckAsked,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **What lights the SHIELD and SUCK buttons** (`ship-asks.ts`): a body the
 * dome answers in the shield's column, and a falling cargo inside the mouth's
 * reach — the owner, 16 October 2026.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function field(queue: SpawnEntry[], pods: PodEntry[] = [], beats = 2): World {
  const world = createWorld({ ...CFG }, 0, queue, pods);
  for (let t = 0; t < TPB * beats; t++) step(world, []);
  return world;
}

describe("the shield is asked for", () => {
  it("by a rock in the shield's column, and not by one beside it", () => {
    const world = field([{ beat: 0, col: 4, kind: "meteor", color: null }]);
    world.shieldCol = 4;
    expect(shieldAsked(world)).toBe(true);
    world.shieldCol = 7;
    expect(shieldAsked(world)).toBe(false);
  });

  it("by a clasp anywhere up its column", () => {
    const world = field([{ beat: 0, col: 2, kind: "clasp", color: "cyan" }]);
    world.shieldCol = 2;
    expect(shieldAsked(world)).toBe(true);
  });

  it("by nothing the dome has no answer to", () => {
    const world = field([{ beat: 0, col: 4, kind: "slick", color: "red" }]);
    world.shieldCol = 4;
    expect(shieldAsked(world)).toBe(false);
  });
});

describe("the mouth is asked for", () => {
  const hung = (kind: "pod" | "husk"): World => {
    const world = field([], [{ beat: 0, col: 5, row: 4, kind }]);
    world.cannonCol = 5;
    return world;
  };

  it("not by a pod still moored", () => {
    expect(suckAsked(hung("pod"))).toBe(false);
  });

  it("by a pod falling inside the reach, and not by one outside it", () => {
    const world = hung("pod");
    const pod = world.pods[0]!;
    pod.loose = true;
    expect(suckAsked(world)).toBe(true);
    world.cannonCol = 5 + CFG.podCatchCols + 1;
    expect(suckAsked(world)).toBe(false);
  });

  it("by a husk exactly as by a pod, which is the face it shows player 1", () => {
    const world = hung("husk");
    world.pods[0]!.loose = true;
    expect(suckAsked(world)).toBe(true);
  });
});
