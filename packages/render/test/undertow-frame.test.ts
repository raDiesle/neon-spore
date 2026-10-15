import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type UndertowLobe,
  type UndertowState,
  undertowBoss,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import type { TextBox } from "./canvas-stub-text.js";
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
 * THE UNDERTOW's plating, on both screens, on the rework of 1 October 2026.
 *
 * The lobes are **set** rather than played into, which is
 * `throat-frame.test.ts`' arrangement and for its reason: which column the
 * floor comes up in is the rng's, and `sim/test/undertow.test.ts` already
 * proves the clock. What this file asks is whether every branch of the
 * picture is one a canvas accepts, and the things nothing else in the suite
 * could catch: that the bow is on the pilot's screen and on no other, that a
 * standing lobe reaches both, that its colour is its answer, and that the
 * level's ebb draws the lobes back in.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("undertow");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function floor(world: World): UndertowState {
  const u = undertowBoss(world);
  if (u === null) throw new Error("the undertow wave installed no floor");
  return u;
}

/** Every colour a screen set over a run of frames, as one string. */
function drawn(world: World, role: ViewRole, ticks: number): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

/** Every word a screen wrote on its last frame. */
function words(world: World, role: ViewRole): string[] {
  let boxes: TextBox[] = [];
  runFrames(world, role, 1, {
    onCanvas: (c) => {
      boxes = [];
      c.texts = boxes;
    },
  });
  return boxes.map((b) => b.text);
}

/** `LEVEL 2/3  0:14` as the seconds it says. */
function secondsOf(text = ""): number {
  const [m = "0", s = "0"] = text.slice(-4).split(":");
  return Number(m) * 60 + Number(s);
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** A world with one lobe set in column 4, its stage begun this beat. */
function withLobe(over: Partial<UndertowLobe> = {}): World {
  const world = opened();
  floor(world).lobes.push({
    col: 4,
    stage: "standing",
    stageBeat: world.beat,
    answer: "maw",
    ...over,
  });
  return world;
}

describe("the undertow", () => {
  for (const role of ROLES) {
    it(`draws a plate bowing for ${role}`, () => {
      expect(drawn(withLobe({ stage: "bowing" }), role, TPB).calls).toBeGreaterThan(500);
    });

    it(`draws a lobe standing, in the colour of its answer, for ${role}`, () => {
      const maw = drawn(withLobe(), role, TPB).text;
      const shield = drawn(withLobe({ answer: "shield" }), role, TPB).text;
      expect(count(maw, PALETTE.pod)).toBeGreaterThan(count(shield, PALETTE.pod));
      expect(count(shield, PALETTE.shield)).toBeGreaterThan(count(maw, PALETTE.shield));
    });

    it(`draws a tall lobe otherwise than a standing one for ${role}`, () => {
      const standing = drawn(withLobe(), role, TPB).text;
      expect(drawn(withLobe({ stage: "tall" }), role, TPB).text).not.toBe(standing);
    });

    it(`draws the ebb shrinking a lobe back for ${role}`, () => {
      const up = withLobe({ stage: "tall" });
      const ebbing = withLobe({ stage: "tall" });
      floor(ebbing).ebbBeat = ebbing.beat;
      const { calls, text } = drawn(ebbing, role, TPB);
      expect(calls).toBeGreaterThan(500);
      expect(text).not.toBe(drawn(up, role, TPB).text);
    });
  }

  it("puts the bow on the pilot's screen and on no other", () => {
    // The warning is his: the navigator is shown the lobe the moment it
    // stands, and nothing of the beats before (`view-role-clocks.ts`).
    const quiet = (role: ViewRole): string => drawn(opened(), role, TPB).text;
    const bow = (role: ViewRole): string => drawn(withLobe({ stage: "bowing" }), role, TPB).text;
    expect(bow("p1")).not.toBe(quiet("p1"));
    expect(bow("p2")).toBe(quiet("p2"));
  });

  it("stands a lobe on both screens", () => {
    for (const role of ROLES) {
      expect(drawn(withLobe(), role, TPB).text, role).not.toBe(drawn(opened(), role, TPB).text);
    }
  });

  it("writes the level and the time it has left on both screens", () => {
    for (const role of ROLES) {
      const first = words(opened(), role).find((t) => t.startsWith("LEVEL"));
      expect(first, role).toMatch(/^LEVEL 1\/3 {2}\d:\d\d$/);
      const later = opened();
      floor(later).phase = "two";
      floor(later).phaseBeat = later.beat - CFG.undertowLevelBeats / 2;
      const second = words(later, role).find((t) => t.startsWith("LEVEL"));
      expect(second, role).toMatch(/^LEVEL 2\/3/);
      // Half the level gone is a smaller number than none of it.
      expect(secondsOf(second)).toBeLessThan(secondsOf(first));
    }
  });

  it("never draws the floor before its wave installs one", () => {
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    for (let i = 0; i < TPB * 2; i++) step(world, []);
    expect(undertowBoss(world)).toBeNull();
    expect(drawn(world, "p1", TPB).text).not.toContain(PALETTE.sheenDeep);
    expect(words(world, "p1").some((t) => t.startsWith("LEVEL"))).toBe(false);
  });
});
