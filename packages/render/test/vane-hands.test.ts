import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type VaneState,
  vanePhase,
  vanePinned,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";
import { spyPulls } from "./pull-spy.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE VANE's haul is the PULL LAB's knob on a channel going down**
 * (`vane-hands.ts`): from SEIZE, while his pin stands, her knob hangs under
 * the casing with a channel and an arrow on her screen and the knob dim on
 * his, and it stands at the foot of the channel once the haul has counted.
 */

beforeAll(installCanvasGlobals);

function pinsFor(name: string): number {
  for (let pins = 0; pins <= 12; pins++) if (vanePhase(pins).name === name) return pins;
  throw new Error(`no pin count leaves the bearing in ${name}`);
}

/** THE VANE under SEIZE, his thumb on the arm or not. */
function seized(pin: boolean, hauled = false): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("vane");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = vane(world);
  b.pins = pinsFor("SEIZE");
  if (pin) {
    const on = { kind: "drag", target: "vaneArm", on: true, fromMilli: 0, fromYMilli: 0 } as const;
    step(world, [{ tick: world.tick, player: 1, command: on }]);
    if (!vanePinned(world, b)) throw new Error("the pilot's thumb did not pin the arm");
  }
  b.hauled = hauled;
  return world;
}

function vane(world: World): VaneState {
  if (world.boss?.kind !== "vane") throw new Error("the vane's wave installed no vane");
  return world.boss;
}

function haul(world: World, role: ViewRole) {
  const spied = spyPulls(() => runFrames(world, role, 1));
  return {
    knobs: spied.knobs.filter((k) => k.key === "vane:haul"),
    tracks: spied.tracks.filter((t) => t.o.key === "vane:haul"),
  };
}

describe("THE VANE's haul", () => {
  it("is a knob with its channel and a downward arrow on her screen", () => {
    const { knobs, tracks } = haul(seized(true), "p2");
    expect(knobs.length).toBe(1);
    expect(knobs[0]?.way).toEqual({ dx: 0, dy: 1 });
    expect(knobs[0]?.theirs).toBe(false);
    expect(tracks.length).toBe(1);
    expect(tracks[0]?.o.at).toBe(0);
    const pts = tracks[0]?.t.pts ?? [];
    expect((pts.at(-1)?.y ?? 0) > (pts[0]?.y ?? 0)).toBe(true);
  });

  it("is her knob dim on his screen, with no channel and no arrow", () => {
    const { knobs, tracks } = haul(seized(true), "p1");
    expect(knobs.length).toBe(1);
    expect(knobs[0]?.theirs).toBe(true);
    expect(knobs[0]?.way).toBeNull();
    expect(tracks.length).toBe(0);
  });

  it("stands at the foot of its channel once the haul has counted", () => {
    const { knobs, tracks } = haul(seized(true, true), "p2");
    expect(tracks[0]?.o.at).toBe(1);
    expect(knobs[0]?.counted).toBe(true);
  });

  it("is not there while no pin stands", () => {
    expect(haul(seized(false), "p2").knobs.length).toBe(0);
  });
});
