import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  ANTIPHON_SHIP,
  type AntiphonState,
  antiphonBoss,
  antiphonSlotCol,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE ANTIPHON's reading, which says nothing**
 * (`render/src/boss-cue-read-p.ts`).
 *
 * Its queue entry said *it says nothing on the field at all* and `TURN` had
 * stood on the organ's grip mark since the handle shipped — the third entry in
 * this family to miss a word a boss builds in its own drawing rather than in a
 * reading (`antiphon-grip.ts`, and `antiphon-frame.test.ts` draws it). `PULL`
 * under the rail is the second of those (`antiphon-rail-grip.ts`), drawn where
 * its handle is and asserted where the handle is asserted: what this page has
 * to keep saying is that the **reading** stays silent while both are up, since
 * a word from here would go out on a screen that has no handle to explain it.
 *
 * Most of this file is about **silence**, which on this boss is the design
 * rather than a caution. The organ's shape is the explainer's and the rail
 * the chooser's; the chooser has to find the one being described and carry
 * it down its vein. The cannon has nothing to do since the redesign of 5
 * October 2026, and the reading must not start giving it something: the case
 * below walks the cannon across the field with an organ standing and asserts
 * that nothing is drawn at any column, which is what would catch a lane
 * making this boss "clearer".
 *
 * No `STILL` on the four beats at `antiphonPits` where the body stops
 * breathing: it stood there until 25 September 2026, when the owner took it
 * off — *for the player it is clear to wait*, and the stilling is drawn to
 * both screens.
 *
 * The states are set rather than played into, as `antiphon-frame.test.ts` sets
 * them: `sim/test/antiphon.test.ts` proves the cycle, the pit, the hardening and
 * the ship.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function hung(): { world: World; s: AntiphonState } {
  const world = createWorld(CFG, 3);
  const index = waveWith("antiphon");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.antiphonOutBeats + 2); i++) step(world, []);
  const s = antiphonBoss(world);
  if (s === null) throw new Error("the antiphon wave grew no body");
  s.organ = null;
  s.rail = [];
  s.answer = -1;
  s.carried = -1;
  s.carryMilli = 0;
  s.pits = [];
  s.cycleBeat = world.beat;
  s.stillBeat = -1;
  s.downBeat = -1;
  s.turnTicks = 0;
  s.heldP1 = false;
  s.heldP2 = false;
  return { world, s };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

function word(world: World, role: ViewRole): string | null {
  return cue(world, role)?.word ?? null;
}

/** One organ grown, the middle of a rail of three. */
function grown(world: World, s: AntiphonState, shape = 1): void {
  s.organ = { shape, turn: 0, grownBeat: world.beat - CFG.antiphonGrowBeats };
  s.rail = [0, shape, 3].map((c, i) => ({ shape: c, turn: 0, col: antiphonSlotCol(CFG, 3, i) }));
  s.answer = 1;
}

/** Every pit taken, nothing standing: the four beats before their own ship. */
function stilled(world: World, s: AntiphonState): void {
  s.pits = [0, 5, 9, 12, 2, 7];
  s.organ = null;
  s.rail = [];
  s.stillBeat = world.beat;
}

describe("THE ANTIPHON's reading", () => {
  it("says nothing through the still, where no bolt lands at all", () => {
    const { world, s } = hung();
    stilled(world, s);
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("says nothing to either seat while an organ stands, at any column", () => {
    const { world, s } = hung();
    grown(world, s);
    for (let col = 0; col < CFG.cols; col++) {
      world.cannonCol = col;
      // No `MOVE` and no `FIRE`: nothing is shot on this boss, and a word
      // over the cannon would send a pair looking for something to shoot.
      expect(word(world, "p1")).toBeNull();
      expect(word(world, "p2")).toBeNull();
    }
  });

  it("is quiet between cycles, through the growth, and once the body is down", () => {
    const { world, s } = hung();
    // Nothing standing and no pit yet: the rest, where the rail is empty and
    // an empty rail says so itself.
    expect(word(world, "p2")).toBeNull();
    // An organ still pushing out, where a carry is a guess and the rail
    // growing to size is the clock.
    grown(world, s);
    if (s.organ === null) throw new Error("no organ was grown");
    s.organ.grownBeat = world.beat;
    expect(word(world, "p2")).toBeNull();
    // And once the body is down.
    stilled(world, s);
    s.downBeat = world.beat;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("draws no still on either screen", () => {
    const drawn = (role: ViewRole): string[] => {
      const { world, s } = hung();
      stilled(world, s);
      const texts: TextBox[] = [];
      runFrames(world, role, 3, {
        every: 3,
        onCanvas: (c) => {
          c.texts = texts;
        },
      });
      return texts.map((t) => t.text);
    };
    expect(drawn("p2")).not.toContain("STILL");
    expect(drawn("p1")).not.toContain("STILL");
  });

  it("still says nothing about their own ship, which is the whole question", () => {
    const { world, s } = hung();
    grown(world, s, ANTIPHON_SHIP);
    for (const c of s.rail) c.shape = ANTIPHON_SHIP;
    s.pits = [0, 5, 9, 12, 2, 7];
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});
