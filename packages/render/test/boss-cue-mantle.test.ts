import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type MantleState,
  mantleBoss,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { mantleCoreCircle, mantleKnobCircle, mantleSide } from "../src/mantle-grip.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE MANTLE, and the four words the field may say about it**
 * (`render/src/boss-cue-read-zc.ts`): `PULL` on each seat's own unheld knob,
 * `HOLD` on it while the shell braces,
 * `TAP` on the core for the seat whose turn it is, `FIRE` over a leaking
 * spark. What is *not* said is the half that matters — nothing on a held
 * knob, whether its thumb is below the floor or past it, because how far is
 * the other seat's line.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The shell hung and its handles lit, nobody on either. */
function hung(): { world: World; s: MantleState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("mantle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = mantleBoss(world);
  if (s === null) throw new Error("the mantle wave hung no shell");
  s.phase = "pull";
  s.phaseBeat = world.beat - 2;
  s.depthMilli = [0, 0];
  return { world, s };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE MANTLE", () => {
  it("asks each seat to PULL its own knob, on that knob", () => {
    const { world, s } = hung();
    for (const [role, seat] of [
      ["p1", 1],
      ["p2", 2],
    ] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("PULL");
      expect(c?.kind).toBe("CARRY");
      expect(c?.seat).toBe(seat);
      const knob = mantleKnobCircle(LAYOUT[role], CFG, s, mantleSide(seat), world.beat, 0);
      expect(c?.x).toBeCloseTo(knob.x, 5);
      expect(c?.y).toBeCloseTo(knob.y, 5);
    }
  });

  it("says nothing on a held knob, below the floor or past it", () => {
    const { world, s } = hung();
    s.depthMilli = [Math.max(1, CFG.mantleFloorMilli - 1), 0];
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("PULL");
    s.depthMilli = [CFG.mantleFloorMilli * 2, CFG.mantleFloorMilli * 2];
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("says nothing while the shell is still dropping in, or once the core is dark", () => {
    const { world, s } = hung();
    s.phase = "still";
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
    s.phase = "dark";
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("asks each seat to HOLD its own knob while the shell braces, until it is held", () => {
    const { world, s } = hung();
    s.phase = "brace";
    s.cursor = s.thresholds.length - 1;
    s.held = [false, false];
    for (const [role, seat] of [
      ["p1", 1],
      ["p2", 2],
    ] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("HOLD");
      expect(c?.kind).toBe("HOLD");
      expect(c?.seat).toBe(seat);
      const knob = mantleKnobCircle(LAYOUT[role], CFG, s, mantleSide(seat), world.beat, 0);
      expect(c?.x).toBeCloseTo(knob.x, 5);
    }
    s.held = [true, false];
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("HOLD");
  });

  it("asks only the seat the finish is waiting on to TAP, on the core", () => {
    const { world, s } = hung();
    s.phase = "heartbeat";
    s.cursor = s.thresholds.length;
    s.heartbeatNext = 0;
    const ring = mantleCoreCircle(LAYOUT.p1, CFG);
    const his = cue(world, "p1");
    expect(his?.word).toBe("TAP");
    expect(his?.kind).toBe("PRESS");
    expect(his?.x).toBeCloseTo(ring.x, 5);
    expect(cue(world, "p2")).toBeNull();
    s.heartbeatNext = 1;
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("TAP");
  });

  it("puts FIRE over a leaking spark ahead of the pull, on either screen", () => {
    const { world, s } = hung();
    s.sparkCol = midCol(CFG);
    s.sparkBeat = world.beat;
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("FIRE");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], s.sparkCol), 5);
      expect(c?.y).toBe(LAYOUT[role].hullY);
    }
  });

  it("never writes a number, a colour or a column", () => {
    const { world, s } = hung();
    const words: string[] = [];
    const say = () => {
      for (const role of ["p1", "p2"] as const) words.push(cue(world, role)?.word ?? "");
    };
    say();
    s.sparkCol = midCol(CFG);
    say();
    s.phase = "heartbeat";
    say();
    for (const w of words) expect(w).toMatch(/^[A-Z ]*$/);
  });
});
