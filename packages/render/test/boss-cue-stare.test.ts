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
import { fieldX } from "../src/field-flip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { stareLidRest } from "../src/stare-lid.js";
import { stareEye, stareGazeFootY } from "../src/stare-shape.js";
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
 * the blue teaching pass, which costs nothing — `FIRE` at the cannon on a
 * shut live beat with a shut beat after it, `MOVE` first if the cannon is not
 * under the eye, and `PULL` beside the lid's ring while the eye charges and
 * no thumb has it yet. Everything else is silence.
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

  it.each(ROLES)("says PULL beside the lid's ring on %s while the eye charges", (role) => {
    const world = hung();
    set(world, "charge", false);
    const mine = cue(world, role);
    expect(mine?.word).toBe("PULL");
    expect(mine?.kind).toBe("CARRY");
    expect(mine?.why).toBe(STARE_WHY.PULL);
    // Level with the ring and clear of it, so the word is not written over
    // the thing it names.
    const rest = stareLidRest(LAYOUT[role], CFG);
    expect(mine?.y).toBe(rest.y);
    expect(mine?.x ?? 0).toBeGreaterThan(rest.x + rest.r * 2);
    // Once a thumb has the lid there is nothing left to say to it.
    eye(world).lidSeat = 1;
    expect(cue(world, role)).toBeNull();
  });

  it.each(["p2", "test"] as const)(
    "says FIRE on %s at the cannon under the eye, aimed at it",
    (role) => {
      const world = hung();
      world.cannonCol = midCol(CFG);
      set(world, "live", false);
      const mine = cue(world, role);
      const l = LAYOUT[role];
      const e = stareEye(l, CFG);
      expect(mine?.word).toBe("FIRE");
      expect(mine?.seat).toBe(2);
      expect(mine?.x).toBe(fieldX(l, midCol(CFG)));
      expect(mine?.y).toBe(l.hullY);
      expect(mine?.aim).toEqual({ x: e.cx, y: e.cy, r: e.ry });
      expect(mine?.why).toBe(STARE_WHY.FIRE);
    },
  );

  it.each(["p1", "test"] as const)(
    "says MOVE on %s at the cannon when it is not under the eye",
    (role) => {
      const world = hung();
      world.cannonCol = midCol(CFG) - 2;
      set(world, "live", false);
      const mine = cue(world, role);
      expect(mine?.word).toBe("MOVE");
      expect(mine?.seat).toBe(1);
      expect(mine?.x).toBe(fieldX(LAYOUT[role], world.cannonCol));
    },
  );

  it("tells each seat only its own half of a clear shot", () => {
    const world = hung();
    world.cannonCol = midCol(CFG);
    set(world, "live", false);
    expect(cue(world, "p1")).toBeNull();
    world.cannonCol = midCol(CFG) - 2;
    expect(cue(world, "p2")).toBeNull();
  });

  it.each(ROLES)("says nothing on %s on the blue pass, open or shut", (role) => {
    const world = hung();
    set(world, "teach", true);
    expect(cue(world, role)).toBeNull();
    set(world, "teach", false);
    expect(cue(world, role)).toBeNull();
  });

  it.each(ROLES)("says nothing on %s on a shut beat before an open one, or at rest", (role) => {
    const world = hung();
    world.cannonCol = midCol(CFG);
    // Beat 2 of `...x....`: a bolt now would land as the eye opens.
    set(world, "live", false, 2);
    expect(cue(world, role)).toBeNull();
    set(world, "rest", false);
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
