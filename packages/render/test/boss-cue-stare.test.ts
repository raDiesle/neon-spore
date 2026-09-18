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
 * **THE STARE, and the one word the field may say about it**
 * (`render/src/boss-cue-read-d.ts`).
 *
 * Most of this file is silence, the way `boss-cue-clocks.test.ts` is: the
 * eye's tell is the fight, and the seat about to be frozen is the one seat
 * that must not be told. So the cases that matter are the ones asserting
 * **nothing** — on the watched seat while the eye turns, on the other seat
 * ever, on both while it looks away — and the one case that lights is the
 * word on the watched seat once the look has landed, where the gaze already
 * is (`decisions.md` #34, `view-role-clocks-b.ts`).
 *
 * **And since the lid, the other seat is told one thing**: SHUT, on the lid's
 * ring, while the look is on and no thumb has it yet. It is the one cue this
 * boss shows the seat that is free to move, and it goes the moment the lid is
 * taken, so a hand already on it is not told to take it.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

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

function set(world: World, phase: StareState["phase"], watching: 0 | 1 | 2): void {
  const s = eye(world);
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.watching = watching;
  s.lookBeats = CFG.stareLookBeats;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE STARE's cue", () => {
  it.each([1, 2] as const)("says STILL on seat %d alone, once the look is on it", (who) => {
    const world = hung();
    set(world, "looking", who);
    const mine = cue(world, `p${who}`);
    expect(mine?.word).toBe("STILL");
    // The word is the kind: the frame carries one line, not a verb over a verb.
    expect(mine?.kind).toBe("STILL");
    expect(mine?.seat).toBe(who);
    // The mark stands at the foot of the gaze, which is the one thing on the
    // watched seat's field the eye has already drawn.
    expect(mine?.y).toBe(stareGazeFootY(LAYOUT[`p${who}`]));
    // The other seat is playing on, and is told nothing of the look itself.
    expect(cue(world, who === 1 ? "p2" : "p1")?.word).not.toBe("STILL");
    // One person holding both seats is the watched one too.
    expect(cue(world, "test")?.word).toBe("STILL");
  });

  it.each([1, 2] as const)(
    "says SHUT on the lid's ring on the seat the eye is not on, %d",
    (who) => {
      const world = hung();
      const other = who === 1 ? 2 : 1;
      set(world, "looking", other);
      const role = `p${who}` as const;
      const mine = cue(world, role);
      expect(mine?.word).toBe("SHUT");
      expect(mine?.kind).toBe("CARRY");
      expect(mine?.seat).toBe(who);
      // It stands on the ring, which is where the thumb has to go.
      const rest = stareLidRest(LAYOUT[role], CFG);
      expect(mine?.x).toBe(rest.x);
      expect(mine?.y).toBe(rest.y);
      // Once a thumb has the lid there is nothing left to say to it.
      eye(world).lidSeat = who;
      expect(cue(world, role)).toBeNull();
      // And the watched seat is never told there is a lid to pull.
      expect(cue(world, `p${other}`)?.word).toBe("STILL");
    },
  );

  it.each(["p1", "p2", "test"] as const)(
    "says nothing on %s while the lid is shut or rising",
    (role) => {
      // Shut, both seats are free and the lid is the whole of the picture;
      // opening, the seat about to be looked at has known since it pulled.
      const world = hung();
      set(world, "shut", 1);
      eye(world).lidSeat = 2;
      expect(cue(world, role)).toBeNull();
      set(world, "opening", 1);
      expect(cue(world, role)).toBeNull();
    },
  );

  it.each(["p1", "p2", "test"] as const)("says nothing on %s while the eye turns", (role) => {
    // The tell is the fight: a cue on the watched seat during the turn would
    // say *it is you* for the partner whose job that is.
    const world = hung();
    set(world, "turning", 1);
    expect(cue(world, role)).toBeNull();
    set(world, "turning", 2);
    expect(cue(world, role)).toBeNull();
  });

  it.each(["p1", "p2", "test"] as const)(
    "says nothing on %s while the eye is away or turning back",
    (role) => {
      const world = hung();
      set(world, "away", 0);
      expect(cue(world, role)).toBeNull();
      set(world, "back", 0);
      expect(cue(world, role)).toBeNull();
    },
  );
});
