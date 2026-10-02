import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  type StareState,
  stareBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { STARE_WHY } from "../src/boss-cue-read-d.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { stareLashCrown } from "../src/stare-lash-pull.js";
import { stareGazeFootY } from "../src/stare-shape.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE STARE, and the words the field may say about it**
 * (`render/src/boss-cue-read-d.ts`), since 29 September 2026 on both seats.
 *
 * `STILL` at the foot of the gaze on an open beat of a live pass — never on
 * the blue teaching pass, which costs nothing — and `PULL` beside the
 * lashes' crown while the eye charges and no thumb is on them yet. Nothing
 * says `FIRE` since 2 October 2026: the eye cannot be hurt. Everything else
 * is silence.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};
const ROLES: ViewRole[] = ["p1", "p2", "test"];

function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("stare");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

function eye(world: World): StareState {
  const s = stareBoss(world);
  if (s === null) throw new Error("the stare wave hung no eye");
  return s;
}

/** The eye in `phase`, `into` beats into it. Level 0 is `...x....`. */
function set(world: World, phase: StareState["phase"], open: boolean, into = 1): void {
  const s = eye(world);
  s.phase = phase;
  s.phaseBeat = world.beat - into;
  s.open = open;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE STARE's cue", () => {
  it.each(ROLES)("says STILL on %s on an open live beat, at the foot of the gaze", (role) => {
    const world = hung();
    set(world, "live", true);
    const mine = cue(world, role);
    expect(mine?.word).toBe("STILL");
    // The word is the kind: the frame carries one line, not a verb over a verb.
    expect(mine?.kind).toBe("STILL");
    expect(mine?.seat).toBeNull();
    expect(mine?.y).toBe(stareGazeFootY(LAYOUT[role]));
    expect(mine?.why).toBe(STARE_WHY.STILL);
  });

  it.each(ROLES)("says PULL beside the lashes on %s while the eye charges", (role) => {
    const world = hung();
    set(world, "charge", false);
    const mine = cue(world, role);
    expect(mine?.word).toBe("PULL");
    expect(mine?.kind).toBe("CARRY");
    expect(mine?.why).toBe(STARE_WHY.PULL);
    // Level with the crown and clear of it, so the word is not written over
    // the thing it names.
    const rest = stareLashCrown(LAYOUT[role], CFG);
    expect(mine?.y).toBe(rest.y);
    expect(mine?.x ?? 0).toBeGreaterThan(rest.x + rest.r * 2);
    // Once a thumb is on the lashes there is nothing left to say to it.
    eye(world).lashHeld[1] = true;
    expect(cue(world, role)).toBeNull();
  });

  it.each(ROLES)("says nothing on %s on a shut live beat: there is nothing to shoot", (role) => {
    const world = hung();
    world.cannonCol = midCol(CFG) - 2;
    set(world, "live", false);
    expect(cue(world, role)).toBeNull();
    world.cannonCol = midCol(CFG);
    expect(cue(world, role)).toBeNull();
  });

  it.each(ROLES)("says nothing on %s on the blue pass, open or shut", (role) => {
    const world = hung();
    set(world, "teach", true);
    expect(cue(world, role)).toBeNull();
    set(world, "teach", false);
    expect(cue(world, role)).toBeNull();
  });

  it.each(ROLES)("says nothing on %s at rest, or while the eye rises", (role) => {
    const world = hung();
    set(world, "rest", false);
    expect(cue(world, role)).toBeNull();
    set(world, "rise", false);
    expect(cue(world, role)).toBeNull();
  });

  it("names no colour, column or count in any of its reasons", () => {
    const banned = ["RED", "BLUE", "CYAN", "GREEN", "COLUMN", "ONE", "TWO", "THREE"];
    for (const why of Object.values(STARE_WHY)) {
      expect(why).toMatch(/^[A-Z ·]+$/);
      for (const word of banned) expect(why.split(" ")).not.toContain(word);
    }
  });
});
