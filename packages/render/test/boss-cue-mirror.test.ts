import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type MirrorState,
  mirrorHoldsControls,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import { mirrorHullY } from "../src/mirror.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE MIRROR, and the one word the field may say about it**
 * (`render/src/boss-cue-read-e.ts`).
 *
 * The fight is a memory game, so nearly everything about it is the answer:
 * which step is next, whose thumb it is on, whether it is a press or a slide.
 * The cases here hold the cue to the one thing that is not — that it is the
 * pair's turn — and to the beats where a thumb would do anything at all. A
 * lane that made the boss "clearer" by lighting the next step would fail the
 * last case (`decisions.md` #34, *never the answer*).
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(): { world: World; m: MirrorState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("mirror");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const m = world.boss;
  if (m === null || m.kind !== "mirror") throw new Error("the mirror's wave installed no mirror");
  return { world, m };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE MIRROR", () => {
  it("says nothing while it holds the controls", () => {
    const { world, m } = opened();
    expect(m.phase).toBe("lead");
    expect(mirrorHoldsControls(world)).toBe(true);
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
    m.phase = "show";
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("asks both seats to REPEAT once the sequence has been shown, over its own cannon", () => {
    const { world, m } = opened();
    m.phase = "listen";
    m.cannonCol = 3;
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word, role).toBe("REPEAT");
      expect(c?.seat, role).toBeNull();
      expect(c?.y, role).toBe(mirrorHullY(LAYOUT[role], CFG));
      expect(c?.x, role).toBe(tileCX(LAYOUT[role], 3));
    }
  });

  it("reaches the word by playing, on the beat the controls come back", () => {
    const { world, m } = opened();
    let guard = 0;
    while (mirrorHoldsControls(world) && guard++ < 60 * TPB) step(world, []);
    expect(m.phase).toBe("listen");
    expect(cue(world, "p1")?.word).toBe("REPEAT");
  });

  it("says nothing about the verdict", () => {
    const { world, m } = opened();
    m.phase = "verdict";
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("never reads the next step: the word and the kind do not change with the round", () => {
    const { world, m } = opened();
    m.phase = "listen";
    const seen = new Set<string>();
    for (let round = 0; round < m.rounds.length; round++) {
      m.round = round;
      for (let matched = 0; matched < (m.rounds[round]?.length ?? 0); matched++) {
        m.matched = matched;
        const c = cue(world, "p2");
        seen.add(`${c?.kind}·${c?.word}·${c?.seat}`);
      }
    }
    expect([...seen]).toEqual(["PRESS·REPEAT·null"]);
  });
});
