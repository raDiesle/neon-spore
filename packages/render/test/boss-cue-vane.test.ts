import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  VANE_CYCLE_BEATS,
  type VaneState,
  vaneOpen,
  vaneOpening,
  vaneWeakCol,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import { vaneBearingY } from "../src/vane-draw.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE VANE, and the two words the field may say about it**
 * (`render/src/boss-cue-read-b.ts`).
 *
 * The fold is the fight, so the load-bearing case is the last one: whatever
 * the arm is doing to whatever is coming in, the field never marks a folded
 * body and never names the column it came out in. What it says is the shot at
 * the bearing, which is an ordinary two-seat gesture in a narrow window
 * (`decisions.md` #34, *never the answer*).
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): { world: World; b: VaneState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("vane");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const b = world.boss;
  if (b === null || b.kind !== "vane") throw new Error("the vane's wave installed no vane");
  return { world, b };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

/** The first beat of the cycle on which the housing is split. */
function openBeat(world: World): number {
  for (let beat = 1; beat <= VANE_CYCLE_BEATS * 2; beat++) {
    world.waveBeat = beat;
    if (vaneOpen(world)) return beat;
  }
  throw new Error("the bearing never split");
}

describe("THE VANE", () => {
  it("says nothing to either seat while the arm is sweeping", () => {
    const { world } = opened();
    let quiet = 0;
    for (let beat = 1; beat <= VANE_CYCLE_BEATS * 2; beat++) {
      world.waveBeat = beat;
      if (vaneOpen(world)) continue;
      quiet++;
      expect(cue(world, "p1"), `beat ${beat}`).toBeNull();
      expect(cue(world, "p2"), `beat ${beat}`).toBeNull();
    }
    // The sweeps are the longer half of the cycle, so this is not a vacuous run.
    expect(quiet).toBeGreaterThan(VANE_CYCLE_BEATS / 2);
  });

  it("asks the pilot to MOVE and the navigator to FIRE once the housing splits", () => {
    const { world } = opened();
    const beat = openBeat(world);
    const weak = vaneWeakCol(CFG, beat);
    world.cannonCol = weak === 0 ? CFG.cols - 1 : 0;

    const his = cue(world, "p1");
    expect(his?.word).toBe("MOVE");
    expect(his?.kind).toBe("CARRY");
    expect(his?.x).toBeCloseTo(tileCX(LAYOUT.p1, world.cannonCol), 6);

    const hers = cue(world, "p2");
    expect(hers?.word).toBe("FIRE");
    expect(hers?.seat).toBe(2);
    // On the mouth of the split, which is drawn on both screens.
    expect(hers?.x).toBeCloseTo(tileCX(LAYOUT.p2, weak), 6);
    expect(hers?.y).toBeCloseTo(vaneBearingY(LAYOUT.p2), 6);
  });

  it("takes his word away when he arrives, and leaves hers standing", () => {
    const { world } = opened();
    const beat = openBeat(world);
    world.cannonCol = vaneWeakCol(CFG, beat);
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("FIRE");
  });

  it("goes quiet once the opening has been spent", () => {
    const { world, b } = opened();
    const beat = openBeat(world);
    world.cannonCol = 0;
    expect(cue(world, "p1")).not.toBeNull();
    // A pin taken out of this opening: the housing is still split and the
    // fight has nothing left to ask for until the next one (`vane.ts`).
    b.spentOpening = vaneOpening(beat);
    expect(vaneOpen(world)).toBe(false);
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("never says the fold: two words, whatever the arm has just thrown", () => {
    const { world, b } = opened();
    const seen = new Set<string>();
    for (let beat = 1; beat <= VANE_CYCLE_BEATS * 2; beat++) {
      world.waveBeat = beat;
      for (const throwCol of [0, 3, CFG.cols - 1]) {
        b.throwBeat = world.beat;
        b.throwCol = throwCol;
        for (const cannonCol of [0, 3, CFG.cols - 1]) {
          world.cannonCol = cannonCol;
          for (const role of ["p1", "p2"] as const) {
            const c = cue(world, role);
            if (c !== null) seen.add(`${c.kind}·${c.word}·${c.seat}`);
          }
        }
      }
    }
    expect([...seen].sort()).toEqual(["CARRY·MOVE·1", "PRESS·FIRE·2"]);
  });
});
