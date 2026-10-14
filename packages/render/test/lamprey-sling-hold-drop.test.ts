import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { lampreyBoss, type SlingStep, type World } from "@neon-spore/sim";
import { lampreyTailRest } from "../src/lamprey-grip.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
} from "./frame-harness.js";
import * as eel from "./lamprey-harness.js";
import * as fork from "./sling-harness.js";
import { spyHolds } from "./soak-spy.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LAMPREY's tail and THE SLING's cords hold the HOLD LAB's drop**
 * (`lamprey-handles.ts`, `sling-pull.ts`): the tail at rest is the drop on
 * both screens, the partner's dimmed, and its cue draws no second one
 * (`BossCue.ownDrop`); an `apart`'s tail is still a pull knob. A cord is the
 * drop while its step asks and its beats are not yet held, its water those
 * beats, and gone once the hold has counted, for the pull's knob.
 */

beforeAll(installCanvasGlobals);

const drops = (world: World, role: ViewRole) => spyHolds(() => runFrames(world, role, 1)).holds;

function bitten(arrange: Parameters<typeof eel.posed>[3] = () => {}, lit = eel.BITE): World {
  const world = eel.stood();
  eel.posed(world, "bite", lit, arrange);
  return world;
}

describe("THE LAMPREY's tail", () => {
  it("is one drop on the tail's rest on the holder's screen, and nothing over it", () => {
    const world = bitten();
    const got = drops(world, "p1");
    expect(got.length).toBe(1);
    const l = computeLayout(VIEWPORT, CFG, "p1");
    const s = lampreyBoss(world);
    if (s === null) throw new Error("no lamprey");
    const rest = lampreyTailRest(l, CFG, s);
    // Within a few pixels of its rest: the eel glances, and its tail with it.
    const far = Math.hypot((got[0]?.at.x ?? 0) - rest.x, (got[0]?.at.y ?? 0) - rest.y);
    expect(far).toBeLessThan(l.tile / 4);
    expect(got[0]?.o.held).toBe(false);
    expect(got[0]?.o.theirs).toBe(false);
  });

  it("sinks under the holder's thumb, and is dimmed on the other seat's screen", () => {
    expect(
      drops(
        bitten((s) => (s.tailDown = [true, false])),
        "p1",
      )[0]?.o.held,
    ).toBe(true);
    const theirs = drops(bitten(), "p2");
    expect(theirs.length).toBe(1);
    expect(theirs[0]?.o.theirs).toBe(true);
  });

  it("is a pull knob in an apart, not a drop", () => {
    expect(drops(bitten(undefined, eel.APART), "p1").length).toBe(0);
  });
});

const LEFT: SlingStep = { ask: "left", aim: "left", color: "either", beats: 4 };
const BOTH: SlingStep = { ...LEFT, ask: "both" };

function drawing(lit: SlingStep, arrange: Parameters<typeof fork.posed>[2] = () => {}): World {
  const world = fork.stood();
  fork.posed(world, lit, (s) => {
    s.loosed = [false, false];
    s.held = [false, false];
    s.holding = [false, false];
    s.drawnBeats = [0, 0];
    s.pullMilli = [-1, -1];
    arrange(s);
  });
  return world;
}

describe("THE SLING's cords", () => {
  it("are a drop on the asked cord, its own seat's lit and the partner's dimmed", () => {
    const own = drops(drawing(LEFT), "p1");
    expect(own.length).toBe(1);
    expect(own[0]?.o.theirs).toBe(false);
    expect(own[0]?.o.held).toBe(false);
    const theirs = drops(drawing(LEFT), "p2");
    expect(theirs.length).toBe(1);
    expect(theirs[0]?.o.theirs).toBe(true);
    expect(drops(drawing(BOTH), "test").length).toBe(2);
  });

  it("sinks under the thumb and fills with the beats held", () => {
    const fresh = drops(drawing(LEFT), "p1")[0]?.o.fill ?? -1;
    const half = drops(
      drawing(LEFT, (s) => {
        s.holding = [true, false];
        s.drawnBeats = [2, 0];
      }),
      "p1",
    )[0];
    expect(half?.o.held).toBe(true);
    expect(half?.o.fill ?? 0).toBeGreaterThanOrEqual(0.5);
    expect(half?.o.fill ?? 0).toBeGreaterThan(fresh);
  });

  it("is no drop once the hold has counted: the pull's knob stands there", () => {
    expect(
      drops(
        drawing(LEFT, (s) => (s.held = [true, false])),
        "p1",
      ).length,
    ).toBe(0);
  });
});
