import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type ThroatState,
  throatBoss,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
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
 * THE THROAT's gullet, on both screens.
 *
 * The slack count and the two receipt beats are **set** rather than played
 * into, which is `baton-frame.test.ts`' arrangement and for its reason: a gum
 * flung into a walking mouth is several beats of arithmetic that
 * `sim/test/throat.test.ts` already proves, and what this file asks is whether
 * every branch of the picture is one a canvas accepts. The two things nothing
 * else in the suite could catch are that a slack ring is still drawn — a
 * choked gullet has to look weaker and not shorter — and that the whole tube
 * reaches both seats, because the seat who owns the fling is the one who has to
 * see the column it is aimed at.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
/** The words under the navigator's lock (`throat-lock.ts`). */
const LABEL = "NEXT INHALE";

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("throat");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function tube(world: World): ThroatState {
  const b = throatBoss(world);
  if (b === null) throw new Error("the throat wave installed no gullet");
  return b;
}

/** Every word a screen wrote over a run of frames. */
function words(world: World, role: ViewRole, ticks: number): string[] {
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      // One canvas takes the whole run and `onCanvas` is handed it once, so a
      // list put here accumulates every word of every frame.
      c.texts = [];
    },
  });
  return (ctx.texts ?? []).map((t) => t.text);
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

describe("the throat", () => {
  for (const role of ROLES) {
    it(`draws the gullet and its inhale for ${role}`, () => {
      const world = opened();
      // Past the first inhale, so the gulp has been through every ring.
      const { calls, text } = drawn(world, role, (CFG.throatInhaleBeats + 2) * TPB);
      expect(calls).toBeGreaterThan(500);
      expect(text).toContain(PALETTE.venom);
    });

    it(`draws a worn gullet with its mouth walking for ${role}`, () => {
      const world = opened();
      const b = tube(world);
      b.slack = 2;
      b.phase = "quick";
      b.phaseBeat = world.beat;
      // Two beats, so the mouth has stepped and turned inside the run rather
      // than standing in the column it was set down in. That a limp ring is
      // still *drawn* is geometry and is asked in `throat-shape.test.ts` —
      // counting canvas calls cannot tell a ring that went away from one
      // whose glow costs a stroke less.
      expect(drawn(world, role, TPB * 2).calls).toBeGreaterThan(500);
    });

    it(`draws the sagging tube and the open mouth for ${role}`, () => {
      const world = opened();
      const b = tube(world);
      b.slack = CFG.throatRings - 1;
      b.phase = "open";
      b.phaseBeat = world.beat;
      expect(drawn(world, role, TPB).calls).toBeGreaterThan(500);
    });

    it(`draws both receipts for ${role}`, () => {
      const world = opened();
      const b = tube(world);
      b.chokedBeat = world.beat;
      b.fedBeat = world.beat;
      const { text } = drawn(world, role, TPB / 2);
      expect(text).toContain(PALETTE.venomRim);
      expect(text).toContain(PALETTE.rock);
    });
  }

  it("draws the eversion and stops when the boss does", () => {
    const world = opened();
    const b = tube(world);
    b.slack = CFG.throatRings;
    b.phase = "everts";
    b.phaseBeat = world.beat;
    // Through the whole eversion and a beat past it: the sim nulls the boss at
    // the end, so the last frames are of a field with no gullet on it.
    const { calls, text } = drawn(world, "test", (CFG.throatEvertBeats + 2) * TPB);
    expect(calls).toBeGreaterThan(500);
    // The inside, which nothing else in the fight ever draws.
    expect(text).toContain(PALETTE.venomDeep);
    expect(throatBoss(world)).toBeNull();
  });

  it("puts the next inhale's lock on the navigator's screen and on no other", () => {
    // The load-bearing test of this file. The column the mouth will be in is
    // the navigator's whole half of this fight, and a copy of it on the
    // pilot's phone would leave the pair nothing to say.
    const p2 = opened();
    expect(words(p2, "p2", TPB)).toContain(LABEL);
    const p1 = opened();
    expect(words(p1, "p1", TPB)).not.toContain(LABEL);
    const both = opened();
    expect(words(both, "test", TPB)).toContain(LABEL);
  });

  it("drops the lock once the mouth inhales every beat", () => {
    // Phase `open` has no beat to arrive at that the mouth is not already in,
    // so a frame there would be a second picture of the lip.
    const world = opened();
    const b = tube(world);
    b.slack = CFG.throatRings - 1;
    b.phase = "open";
    b.phaseBeat = world.beat;
    expect(words(world, "p2", TPB)).not.toContain(LABEL);
  });

  it("shows the whole gullet to both seats", () => {
    // Nothing about the tube as it stands is kept from either screen: the
    // mouth's column this beat is what a fling is judged against, and the
    // pilot owns the fling. What the navigator gets alone is the column the
    // mouth will be in next, and the count — neither of which is drawn yet.
    const p1 = opened();
    const p2 = opened();
    const beats = (CFG.throatInhaleBeats + 1) * TPB;
    expect(drawn(p1, "p1", beats).text).toContain(PALETTE.venom);
    expect(drawn(p2, "p2", beats).text).toContain(PALETTE.venom);
  });

  it("never draws the gullet before its wave installs one", () => {
    // The plain waves have no boss at all, and a throat drawn over one would
    // be a fixture leaking out of `boss-draw`'s chain.
    const world = createWorld(CFG, 7, buildQueue(0, CFG.cols));
    for (let i = 0; i < TPB * 2; i++) step(world, []);
    expect(throatBoss(world)).toBeNull();
    expect(drawn(world, "p1", TPB).text).not.toContain(PALETTE.venomRim);
  });
});
