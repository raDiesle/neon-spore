import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  ANTIPHON_SHIP,
  type AntiphonState,
  antiphonBoss,
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
 * under her rail is the second of those (`antiphon-rail-grip.ts`), drawn where
 * its handle is and asserted where the handle is asserted: what this page has
 * to keep saying is that the **reading** stays silent while both are up, since
 * a word from here would go out on a screen that has no handle to explain it.
 *
 * Most of this file is about **silence**, which on this boss is the design
 * rather than a caution. The organ's shape is the pilot's and its colour and
 * column are the navigator's; she has to find the one he is describing and fire
 * its colour into its column, and he has to put the cannon there, which he
 * cannot see either. So a `MOVE` on his hull would be her rail read out on his
 * screen, and a `MOVE` that went out the beat he arrived would say he had
 * arrived — the leak by subtraction THE LEAD's reading found. The case below
 * walks the cannon across the field with an organ standing and asserts that
 * nothing is drawn to him at any column, which is what would catch a lane making
 * this boss "clearer".
 *
 * There is no `FIRE` either, and for the other reason: she is already told *when*
 * twice on her own screen, by the rail's candidates reaching full size as
 * `antiphonGrowBeats` runs out and by the window gauge beginning to fall
 * (`antiphon-draw.ts`). And no `STILL` on the four beats at `antiphonPits` where
 * the body stops breathing and `antiphonStruck` refuses every bolt: it stood
 * there until 25 September 2026, when the owner took it off — *for the player
 * it is clear to wait*, and the stilling is drawn to both screens.
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
  s.organs = [];
  s.rail = [];
  s.pits = [];
  s.extra = 0;
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

/** One organ grown over column 4, red, on a rail of three. */
function grown(world: World, s: AntiphonState, shape = 1): void {
  s.organs = [{ shape, col: 4, color: "red", grownBeat: world.beat - CFG.antiphonGrowBeats }];
  s.rail = [
    { shape: 0, col: 2, color: "cyan" },
    { shape, col: 4, color: "red" },
    { shape: 3, col: 6, color: "red" },
  ];
}

/** Every pit taken, nothing standing: the four beats before their own ship. */
function stilled(world: World, s: AntiphonState): void {
  s.pits = [0, 5, 9, 12, 2, 7];
  s.organs = [];
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
      // No `MOVE`: the column is on her rail alone, so the word would be her
      // screen read out on his and its absence the same leak by subtraction.
      expect(word(world, "p1")).toBeNull();
      // No `FIRE`: the rail's candidates reach full size as the grow beats run
      // out and the window gauge falls from that beat, so *when* is hers twice
      // over and *which* is the question the field must not answer.
      expect(word(world, "p2")).toBeNull();
    }
  });

  it("is quiet between cycles, through the growth, and once the body is down", () => {
    const { world, s } = hung();
    // Nothing standing and no pit yet: the rest, where her rail is empty and an
    // empty rail says so itself.
    expect(word(world, "p2")).toBeNull();
    // An organ still pushing out, where a bolt is a guess and the rail growing
    // to size is the clock.
    grown(world, s);
    const o = s.organs[0];
    if (o === undefined) throw new Error("no organ was grown");
    o.grownBeat = world.beat;
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
