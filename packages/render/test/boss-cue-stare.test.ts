import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type StareState,
  stareBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { stareLidRest } from "../src/stare-lid.js";
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
 * **THE STARE, and the two words the field may say about it**
 * (`render/src/boss-cue-read-d.ts`), since 29 September 2026 on both seats.
 *
 * `STILL` at the foot of the gaze on an open beat of a live pass — never on
 * the blue teaching pass, which costs nothing — and `PULL` on the lid's ring
 * while the eye charges and no thumb has it yet. Everything else is silence.
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

function set(world: World, phase: StareState["phase"], open: boolean): void {
  const s = eye(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
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
  });

  it.each(ROLES)("says PULL on the lid's ring on %s while the eye charges", (role) => {
    const world = hung();
    set(world, "charge", false);
    const mine = cue(world, role);
    expect(mine?.word).toBe("PULL");
    expect(mine?.kind).toBe("CARRY");
    // It stands on the ring, which is where the thumb has to go.
    const rest = stareLidRest(LAYOUT[role], CFG);
    expect(mine?.x).toBe(rest.x);
    expect(mine?.y).toBe(rest.y);
    // Once a thumb has the lid there is nothing left to say to it.
    eye(world).lidSeat = 1;
    expect(cue(world, role)).toBeNull();
  });

  it.each(ROLES)("says nothing on %s on the blue pass, open or shut", (role) => {
    const world = hung();
    set(world, "teach", true);
    expect(cue(world, role)).toBeNull();
    set(world, "teach", false);
    expect(cue(world, role)).toBeNull();
  });

  it.each(ROLES)("says nothing on %s on a shut live beat, or at rest", (role) => {
    const world = hung();
    set(world, "live", false);
    expect(cue(world, role)).toBeNull();
    set(world, "rest", false);
    expect(cue(world, role)).toBeNull();
  });
});
