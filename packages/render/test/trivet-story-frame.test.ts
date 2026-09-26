import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type TrivetState,
  type TrivetStep,
  ticksPerBeat,
  trivetBoss,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { trivetLurchLift } from "../src/trivet-story.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE TRIVET's two story steps, drawn (`render/src/trivet-story.ts`): the
 * lurch — the hub thrown out over its column, the far foot up and settling
 * once the leaning foot is held — and the needle flung out and sinking, on
 * all three screens. Set rather than played to, `trivet-frame.test.ts`'s
 * arrangement; `sim/test/trivet-story.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const TPB = ticksPerBeat(CFG);
const TIP: TrivetStep = { ask: "tip", pads: 3, color: "either", beats: 4, offset: -2 };
const NEEDLE: TrivetStep = { ask: "needle", pads: 2, color: "either", beats: 4, offset: 2 };

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("trivet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** Both feet home and the hub lit, `lit` under the cursor `beats` beats in. */
function posed(world: World, lit: TrivetStep | null, beats = 2): TrivetState {
  const s = trivetBoss(world);
  if (s === null) throw new Error("the trivet wave stood no stand");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - beats;
  s.feet = [2, 2];
  s.hits = 1;
  s.hubLit = true;
  s.padsDown = [0, 0];
  s.heldBeats = 0;
  s.cursor = 0;
  if (lit !== null) s.steps[0] = lit;
  return s;
}

function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

describe("THE TRIVET's lurch", () => {
  it.each(ROLES)("throws the hub over its column, on %s", (role) => {
    const standing = frame(role, (w) => posed(w, null));
    const lurching = frame(role, (w) => posed(w, TIP));
    expect(lurching).not.toBe(standing);
    expect(frame(role, (w) => posed(w, TIP, 1))).not.toBe(lurching);
  });

  it.each(ROLES)("settles the far foot once the leaning one is held, on %s", (role) => {
    const loose = frame(role, (w) => posed(w, TIP));
    const held = frame(role, (w) => {
      posed(w, TIP).padsDown = [7, 0];
    });
    expect(held).not.toBe(loose);
  });

  it("lifts only the far foot, and less once the near one is held", () => {
    const world = stood();
    const s = posed(world, TIP);
    const up = trivetLurchLift(s, 1, world.beat, 0);
    expect(trivetLurchLift(s, 0, world.beat, 0)).toBe(0);
    expect(up).toBeGreaterThan(0);
    s.padsDown = [7, 0];
    expect(trivetLurchLift(s, 1, world.beat, 0)).toBeLessThan(up);
  });
});

describe("THE TRIVET's needle", () => {
  it.each(ROLES)("flings a needle out with its sight to the hull, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, null));
    const flung = frame(role, (w) => posed(w, NEEDLE));
    expect(count(flung, PALETTE.trivetSocket)).toBeGreaterThan(
      count(resting, PALETTE.trivetSocket),
    );
    expect(frame(role, (w) => posed(w, NEEDLE, 3))).not.toBe(flung);
  });

  it("draws the same needle the same way twice", () => {
    expect(frame("p2", (w) => posed(w, NEEDLE))).toBe(frame("p2", (w) => posed(w, NEEDLE)));
  });
});
