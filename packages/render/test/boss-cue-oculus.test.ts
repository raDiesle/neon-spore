import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  type OculusAsk,
  type OculusState,
  oculusBoss,
  oculusLookCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { oculusHalfStanding } from "../src/oculus-grip.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE OCULUS, and the two words the field may say about it**
 * (`render/src/boss-cue-read-ze.ts`): `HOLD` on each seat's half of the lens
 * while a pair is lit, gone the moment that seat's thumb is down, and `FIRE`
 * under the middle column while the core is lit — under the column it looks
 * down on a look — and `SHIELD` under the middle on a glare. What is *not* said: nothing
 * between steps or through the break, and never the colour the core wants.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The lens stood and resting, nothing held. */
function stood(): { world: World; s: OculusState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("oculus");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.oculusStillBeats + 1); i++) step(world, []);
  const s = oculusBoss(world);
  if (s === null) throw new Error("the oculus wave stood no lens");
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.held = [false, false];
  return { world, s };
}

/** Light the first step of the script that asks `ask`. */
function light(s: OculusState, world: World, ask: OculusAsk): void {
  const at = s.steps.findIndex((x) => x.ask === ask);
  if (at < 0) throw new Error(`the oculus script has no ${ask} step`);
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = at;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE OCULUS", () => {
  it.each(["shut", "reseal"] as const)("asks each seat to HOLD its own half on a lit %s", (ask) => {
    const { world, s } = stood();
    light(s, world, ask);
    for (const seat of [1, 2] as const) {
      const role = seat === 1 ? "p1" : "p2";
      const c = cue(world, role);
      expect(c?.word).toBe("HOLD");
      expect(c?.kind).toBe("HOLD");
      expect(c?.seat).toBe(seat);
      const half = oculusHalfStanding(LAYOUT[role], world, s, seat, 0);
      expect(c?.x).toBeCloseTo(half.x, 5);
      expect(c?.y).toBeCloseTo(half.y, 5);
    }
  });

  it("takes the word off a seat the moment its thumb is down, and leaves the other's", () => {
    const { world, s } = stood();
    light(s, world, "shut");
    s.held = [true, false];
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")?.word).toBe("HOLD");
    s.held = [true, true];
    expect(cue(world, "p2")).toBeNull();
  });

  it("says nothing between steps, through the break or as it shatters", () => {
    const { world, s } = stood();
    for (const phase of ["still", "rest", "shatter"] as const) {
      s.phase = phase;
      expect(cue(world, "p1")).toBeNull();
      expect(cue(world, "p2")).toBeNull();
    }
    light(s, world, "break");
    expect(cue(world, "p1")).toBeNull();
    expect(cue(world, "p2")).toBeNull();
  });

  it("puts FIRE under the middle column while the core is lit, on either screen", () => {
    const { world, s } = stood();
    light(s, world, "fire");
    s.socketOpen = true;
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("FIRE");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)), 5);
      expect(c?.y).toBe(LAYOUT[role].hullY);
    }
  });

  it("puts FIRE under the column the eye looks down on a look", () => {
    const { world, s } = stood();
    light(s, world, "look");
    const look = s.steps[s.cursor];
    if (look === undefined) throw new Error("no look step");
    expect(look.offset ?? 0).not.toBe(0);
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("FIRE");
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], oculusLookCol(midCol(CFG), look)), 5);
    }
  });

  it("puts SHIELD under the middle column on a glare, on either screen", () => {
    const { world, s } = stood();
    light(s, world, "glare");
    for (const role of ["p1", "p2"] as const) {
      const c = cue(world, role);
      expect(c?.word).toBe("SHIELD");
      expect(c?.seat).toBeNull();
      expect(c?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)), 5);
      expect(c?.y).toBe(LAYOUT[role].hullY);
    }
  });

  it("never writes a number, a colour or a column", () => {
    const { world, s } = stood();
    const words: string[] = [];
    for (const ask of ["shut", "fire", "reseal", "glare", "look"] as const) {
      light(s, world, ask);
      for (const role of ["p1", "p2"] as const) words.push(cue(world, role)?.word ?? "");
    }
    for (const w of words) expect(w).toMatch(/^[A-Z ]*$/);
  });
});
