import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GrindstoneAsk,
  type GrindstoneState,
  grindstoneBoss,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { grindstoneAxleStanding, grindstoneStanding } from "../src/grindstone-grip.js";
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
 * **THE GRINDSTONE, and the three words the field may say about it**
 * (`render/src/boss-cue-read-zj.ts`): `RUB` on the lit flat to its seat for
 * the whole pass, `HOLD` on each jaw a clamp asks for, gone the moment both
 * its pads are down, and `FIRE` under the middle column once the caliper is
 * locked on a fire step. What is *not* said: nothing between steps or as the
 * wheel spins free, no shot before the caliper has bitten, never on the other
 * seat's side, and never a count or the colour the axle wants.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const BOTH_PADS = 0b11;
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The wheel dropped in and resting, no pad down on either jaw. */
function stood(): { world: World; s: GrindstoneState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("grindstone");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.grindstoneStillBeats + 1); i++) step(world, []);
  const s = grindstoneBoss(world);
  if (s === null) throw new Error("the grindstone wave stood no wheel");
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.padsDown = [0, 0];
  s.locked = false;
  return { world, s };
}

/** Light the first step of the script that asks `ask`. */
function light(s: GrindstoneState, world: World, ask: GrindstoneAsk): void {
  const at = s.steps.findIndex((x) => x.ask === ask);
  if (at < 0) throw new Error(`the grindstone script has no ${ask} step`);
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = at;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE GRINDSTONE", () => {
  it.each([
    ["left", 1, "grindFlatLeft"],
    ["right", 2, "grindFlatRight"],
  ] as const)("asks only the %s flat's seat to RUB it, on the flat", (ask, seat, target) => {
    const { world, s } = stood();
    light(s, world, ask);
    const role = seat === 1 ? "p1" : "p2";
    const c = cue(world, role);
    expect(c?.word).toBe("RUB");
    expect(c?.kind).toBe("CARRY");
    expect(c?.seat).toBe(seat);
    const flat = grindstoneStanding(LAYOUT[role], CFG, s, target, world.beat, 0);
    expect(c?.x).toBeCloseTo(flat.x, 5);
    expect(c?.y).toBeCloseTo(flat.y, 5);
    expect(cue(world, seat === 1 ? "p2" : "p1")).toBeNull();
  });

  it("keeps RUB up while the thumb is on it", () => {
    const { world, s } = stood();
    light(s, world, "left");
    s.rubbed = [true, false];
    s.gritMilli = [100, s.gritMilli[1]];
    expect(cue(world, "p1")?.word).toBe("RUB");
  });

  it("asks both seats to HOLD a clamp, and takes each word off once that jaw is shut", () => {
    const { world, s } = stood();
    light(s, world, "clamp");
    for (const [role, target] of [
      ["p1", "grindJawLeft"],
      ["p2", "grindJawRight"],
    ] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("HOLD");
      expect(c?.kind).toBe("HOLD");
      const jaw = grindstoneStanding(LAYOUT[role], CFG, s, target, world.beat, 0);
      expect(c?.x).toBeCloseTo(jaw.x, 5);
      expect(c?.y).toBeCloseTo(jaw.y, 5);
    }
    s.padsDown = [BOTH_PADS, 0];
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("HOLD");
    s.padsDown = [0b01, BOTH_PADS];
    expect(cue(world, "p1")?.word).toBe("HOLD");
    expect(cue(world, "p2")).toBeNull();
  });

  it("says nothing between steps or as it spins free", () => {
    const { world, s } = stood();
    for (const phase of ["still", "rest", "free"] as const) {
      s.phase = phase;
      expect(cue(world, "p1")).toBeNull();
      expect(cue(world, "p2")).toBeNull();
    }
  });

  it("puts FIRE under the middle column once the caliper is locked, on either screen", () => {
    const { world, s } = stood();
    light(s, world, "fire");
    expect(cue(world, "p1")).toBeNull();
    s.locked = true;
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("FIRE");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)), 5);
      expect(c?.y).toBe(LAYOUT[role].hullY);
      // The owner, 29 September 2026, every boss: a shot cue carries a clear
      // aim target (`cue-helper.ts`). The word stays at the hull, where the
      // cannon goes; the crosshair rides the thing it is fired at.
      const axle = grindstoneAxleStanding(LAYOUT[role], CFG, s, world.beat, 0);
      expect(c?.aim?.x).toBeCloseTo(axle.x, 5);
      expect(c?.aim?.y).toBeCloseTo(axle.y, 5);
      expect(c?.aim?.y).toBeLessThan(LAYOUT[role].hullY);
    }
  });

  it("never writes a number, a colour or a column", () => {
    const { world, s } = stood();
    const words: string[] = [];
    for (const ask of ["left", "right", "clamp", "fire"] as const) {
      light(s, world, ask);
      s.locked = true;
      for (const role of ["p1", "p2"] as const) words.push(cue(world, role)?.word ?? "");
    }
    for (const w of words) expect(w).toMatch(/^[A-Z ]*$/);
  });
});
