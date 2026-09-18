import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  PULSE_LANES,
  type PulseState,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE PULSE, and the finding that it may be told nothing at all**
 * (`render/src/boss-cue.ts`, the comment over `default`).
 *
 * This is the only round read against `docs/decisions.md` #34 and left silent,
 * so the silence is what the file holds: the four verbs are four lanes, both
 * seats hold all four, and the round's only question is *which lane, and now*.
 * The lane is the word a veiled seat has to be given out loud and the moment
 * is what the judgement is made of, so every cue the field could draw here is
 * #34's *never the answer*, twice over.
 *
 * A lane that "helps" this round by writing `PRESS` on the line has taken the
 * round away, and the case below is what says so before the frame is drawn.
 */

beforeAll(installCanvasGlobals);

const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): { world: World; p: PulseState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("pulse");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const p = world.boss;
  if (p === null || p.kind !== "pulse") throw new Error("the pulse's wave installed no pulse");
  return { world, p };
}

function silent(world: World): void {
  for (const role of ["p1", "p2", "test"] as const) {
    const l = LAYOUT[role];
    expect(bossCue(l, world, 0, () => l.hullY)).toBeNull();
  }
}

describe("THE PULSE", () => {
  it("says nothing on any screen, in any phase of the round", () => {
    const { world, p } = opened();
    for (const phase of ["count", "play", "verdict", "spent"] as const) {
      p.phase = phase;
      silent(world);
    }
  });

  it("says nothing while a veiled arrival is falling, whichever seat is blind", () => {
    const { world, p } = opened();
    p.phase = "play";
    for (const veil of [1, 2] as const) {
      p.notes = PULSE_LANES.map((lane, i) => ({ step: i * 4, lane, veil }));
      for (let t = 0; t < 8; t++) {
        step(world, []);
        silent(world);
      }
    }
  });
});
