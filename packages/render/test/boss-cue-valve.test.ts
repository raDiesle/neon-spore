import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  NO_SPARK,
  startWave,
  step,
  ticksPerBeat,
  VALVE_PINS,
  type ValvePhase,
  type ValveState,
  valveBoss,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { cueAimAt } from "../src/boss-cue-frame.js";
import { fieldX } from "../src/field-flip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { valveLivePinCircle, valveSocketCircle, valveWheelCircle } from "../src/valve-grip.js";
import { valveDrumAt, valveSparkNow } from "../src/valve-spark.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE VALVE, and the four words the field may say about it**
 * (`render/src/boss-cue-read-zp.ts`): `TURN` on the wheel to the pilot,
 * `FREEZE` on the socket to the navigator, `PULL` on the live pin to either,
 * and `FIRE` under the falling spark; and the story's `TAP`, `HOLD` and
 * `RUB` on the socket to either. What is *not* said matters as much:
 * nothing to the pilot while the navigator's tap is wanted, and nothing once
 * the wheel holds but the tap.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The drum hung, a few beats in, in `phase` with every pin in and no spark loose. */
function hung(phase: ValvePhase): { world: World; s: ValveState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("valve");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = valveBoss(world);
  if (s === null) throw new Error("the valve wave hung no drum");
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.pins = VALVE_PINS;
  s.sparkCol = NO_SPARK;
  return { world, s };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE VALVE", () => {
  it("asks the pilot to TURN, on the wheel, and says nothing to the navigator", () => {
    const { world, s } = hung("turn");
    const c = cue(world, "p1");
    expect(c).toMatchObject({ word: "TURN", kind: "TURN", seat: 1 });
    const wheel = valveWheelCircle(LAYOUT.p1, CFG, s, world.beat, 0);
    expect(c?.x).toBeCloseTo(wheel.x, 5);
    expect(c?.y).toBeCloseTo(wheel.y, 5);
    expect(cue(world, "p2")).toBeNull();
  });

  it("asks the navigator to TAP, on the socket, once the wheel holds, and the pilot nothing", () => {
    const { world, s } = hung("hold");
    const c = cue(world, "p2");
    expect(c).toMatchObject({ word: "TAP", kind: "PRESS", seat: 2, why: "TO FREEZE THE WHEEL" });
    const socket = valveSocketCircle(LAYOUT.p2, CFG, s, world.beat, 0);
    expect(c?.x).toBeCloseTo(socket.x, 5);
    expect(c?.y).toBeCloseTo(socket.y, 5);
    expect(cue(world, "p1")).toBeNull();
  });

  it("asks either seat to PULL, on the live pin, while frozen", () => {
    const { world, s } = hung("frozen");
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c).toMatchObject({ word: "PULL", seat: null });
      const pin = valveLivePinCircle(LAYOUT[role], CFG, s, world.beat, 0);
      expect(c?.x).toBeCloseTo(pin?.x ?? Number.NaN, 5);
      expect(c?.y).toBeCloseTo(pin?.y ?? Number.NaN, 5);
    }
  });

  it("puts FIRE under the spark ahead of the wheel, on either screen", () => {
    const { world, s } = hung("turn");
    s.pins = VALVE_PINS - 1;
    s.sparkCol = 1;
    // A beat into its fall, so the crosshair is seen to have left the drum.
    s.sparkBeat = world.beat - 1;
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c).toMatchObject({ word: "FIRE", seat: null, y: LAYOUT[role].hullY });
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], 1), 5);
      const drum = valveDrumAt(LAYOUT[role], CFG, s, world.beat, 0);
      // The owner, 29 September 2026, every boss: a shot cue carries a clear
      // aim target (`cue-helper.ts`). The word stays at the hull, where the
      // cannon goes; the crosshair rides the thing it is fired at.
      const want = cueAimAt(
        LAYOUT[role],
        valveSparkNow(LAYOUT[role], world, s, drum, world.beat, 0),
      );
      expect(c?.aim?.x).toBeCloseTo(want.x, 5);
      expect(c?.aim?.y).toBeCloseTo(want.y, 5);
      expect(c?.aim?.r).toBeCloseTo(want.r, 5);
      expect(c?.aim?.y).toBeLessThan(LAYOUT[role].hullY);
      expect(c?.aim?.x).toBeCloseTo(fieldX(LAYOUT[role], 1), 5);
      expect(c?.aim?.y).toBeGreaterThan(drum.y);
    }
  });

  it.each([
    ["jet", "TAP", "PRESS"],
    ["brace", "HOLD", "HOLD"],
    ["wipe", "RUB", "CARRY"],
    ["seal", "HOLD", "HOLD"],
  ] as const)("says the story's %s to either seat, on the socket: %s", (phase, word, kind) => {
    const { world, s } = hung(phase);
    s.pins = VALVE_PINS - 1;
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c).toMatchObject({ word, kind, seat: null });
      const socket = valveSocketCircle(LAYOUT[role], CFG, s, world.beat, 0);
      expect(c?.x).toBeCloseTo(socket.x, 5);
      expect(c?.y).toBeCloseTo(socket.y, 5);
    }
  });

  it("says nothing while the drum drops in, lists or hangs open", () => {
    for (const phase of ["still", "list", "open"] as const) {
      const { world } = hung(phase);
      expect(cue(world, "p1")).toBeNull();
      expect(cue(world, "p2")).toBeNull();
    }
  });
});
