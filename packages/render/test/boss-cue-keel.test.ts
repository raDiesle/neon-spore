import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type KeelState,
  keelBoss,
  midCol,
  NO_JOINT,
  NO_ROCK,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { keelJointCircle } from "../src/keel-grip.js";
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
 * **THE KEEL, and the three words the field may say about it**
 * (`render/src/boss-cue-read-zd.ts`): `TAP` on the lit joint for the seat
 * whose half it sits over, `FIRE` under the open socket and `FIRE` under the
 * falling rock. What is *not* said is the half that matters: nothing on the
 * other seat's screen while a joint is lit on one side, and never the colour
 * the socket wants.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const N = CFG.keelSegments;
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The spine hung and resting in its first movement, nothing locked or thrown. */
function hung(): { world: World; s: KeelState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.movement = 1;
  s.joint = NO_JOINT;
  s.locked = s.locked.map(() => false);
  s.rockCol = NO_ROCK;
  return { world, s };
}

function light(s: KeelState, world: World, seg: number): void {
  s.phase = "joint";
  s.phaseBeat = world.beat;
  s.joint = seg;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE KEEL", () => {
  it("asks only the seat whose half the joint sits over to TAP, on its ring", () => {
    const { world, s } = hung();
    for (const [seg, seat, other] of [
      [0, "p1", "p2"],
      [N - 1, "p2", "p1"],
    ] as const) {
      light(s, world, seg);
      const c = cue(world, seat);
      expect(c?.word).toBe("TAP");
      expect(c?.kind).toBe("PRESS");
      const ring = keelJointCircle(LAYOUT[seat], CFG, s, world.beat, 0);
      expect(c?.x).toBeCloseTo(ring?.x ?? Number.NaN, 5);
      expect(c?.y).toBeCloseTo(ring?.y ?? Number.NaN, 5);
      expect(cue(world, other)).toBeNull();
    }
  });

  it("says nothing between joints, while the spine drops in or once it is straight", () => {
    const { world, s } = hung();
    for (const phase of ["rest", "still", "rigid", "straight"] as const) {
      s.phase = phase;
      expect(cue(world, "p1")).toBeNull();
      expect(cue(world, "p2")).toBeNull();
    }
  });

  it("puts FIRE under the middle column while the socket is open, on either screen", () => {
    const { world, s } = hung();
    s.phase = "socket";
    s.phaseBeat = world.beat;
    s.movement = 2;
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("FIRE");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)), 5);
      expect(c?.y).toBe(LAYOUT[role].hullY);
    }
  });

  it("puts FIRE under the rock ahead of a lit joint, on either screen", () => {
    const { world, s } = hung();
    light(s, world, 0);
    s.rockCol = 2;
    s.rockBeat = world.beat;
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("FIRE");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], 2), 5);
    }
  });

  it("never writes a number, a colour or a column", () => {
    const { world, s } = hung();
    const words: string[] = [];
    const say = () => {
      for (const role of ["p1", "p2"] as const) words.push(cue(world, role)?.word ?? "");
    };
    light(s, world, 2);
    say();
    s.phase = "socket";
    say();
    s.rockCol = 1;
    say();
    for (const w of words) expect(w).toMatch(/^[A-Z ]*$/);
  });
});
