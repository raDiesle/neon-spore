import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  type CapstanState,
  type CapstanStep,
  capstanBoss,
  createWorld,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import {
  capstanCoreStanding,
  capstanRubStanding,
  capstanSteerStanding,
} from "../src/capstan-grip.js";
import { fieldX } from "../src/field-flip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { touchDown } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE CAPSTAN, and the four words the field may say about it**
 * (`render/src/boss-cue-read-zl.ts`): `PULL` to the seat that steers until
 * the band's face is round, then `HOLD` on the middle to that seat and `RUB`
 * on that face to the other; on a hold `PULL` to both until somebody pulls,
 * then `HOLD` to that seat and `RUB` to the other; and `FIRE` under the
 * middle column on a bared core. What is
 * *not* said: nothing between steps, and never the shot's colour. And a
 * word is where the thumb goes: a press on `PULL` takes the pull.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const PULL = CFG.capstanPullMilli;
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

/** The drum standing, `ask` lit a beat ago, level, unworn and covered. */
function lit(ask: CapstanStep["ask"] | null): { world: World; s: CapstanState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("capstan");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = capstanBoss(world);
  if (s === null) throw new Error("the capstan wave stood no drum");
  s.phase = ask === null ? "rest" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.wear = [0, 0];
  s.bared = false;
  s.pullMilli = [0, 0];
  s.rubs = [0, 0];
  s.heldBeats = 0;
  if (ask !== null) s.steps[0] = { ask, color: ask === "fire" ? "red" : "either", beats: 10 };
  return { world, s };
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

describe("THE CAPSTAN", () => {
  it.each([
    ["left", "p1", "p2", 0, -PULL],
    ["right", "p2", "p1", 1, PULL],
  ] as const)(
    "says PULL on a %s band to the steerer, then HOLD to it and RUB to the other",
    (ask, steerer, wearer, i, tilt) => {
      const { world, s } = lit(ask);
      expect(cue(world, steerer)?.word).toBe("PULL");
      expect(cue(world, steerer)?.kind).toBe("CARRY");
      expect(cue(world, wearer)).toBeNull();
      s.pullMilli[i] = -tilt;
      expect(cue(world, steerer)?.word).toBe("PULL");
      s.pullMilli[i] = tilt;
      const held = cue(world, steerer);
      const mid = capstanSteerStanding(LAYOUT[steerer], CFG, s, world.beat, 0);
      expect(held?.word).toBe("HOLD");
      expect(held?.x).toBeCloseTo(mid.x);
      expect(held?.y).toBeCloseTo(mid.y);
      const said = cue(world, wearer);
      const at = capstanRubStanding(LAYOUT[wearer], CFG, s, world.beat, 0);
      expect(said?.word).toBe("RUB");
      expect(said?.kind).toBe("CARRY");
      expect(said?.x).toBeCloseTo(at.x);
      expect(said?.y).toBeCloseTo(at.y);
    },
  );

  it.each([
    ["left", "p1", 1],
    ["right", "p2", 2],
    ["hold", "p1", 1],
    ["hold", "p2", 2],
  ] as const)("stands PULL where a press takes the pull, on a %s step on %s", (ask, role, seat) => {
    const { world } = lit(ask);
    const said = cue(world, role);
    if (said?.word !== "PULL") throw new Error("no PULL");
    const touch = touchDown(LAYOUT[role], said.x, said.y, {
      creatures: world.creatures,
      cannonCol: world.cannonCol,
      shieldCol: world.shieldCol,
      beatPhase: 0,
      skinY: null,
      beat: world.beat,
      waveBeat: world.waveBeat,
      tick: world.tick,
      seat,
      cfg: CFG,
      boss: world.boss,
      controls: controlSet("default"),
      faults: [],
      well: false,
    });
    expect(touch?.hold?.kind === "drag" ? touch.hold.target : null).toBe("capstanSteer");
  });

  it("says PULL on a hold to both until one pulls, then HOLD to it and RUB to the other", () => {
    const { world, s } = lit("hold");
    expect(cue(world, "p1")?.word).toBe("PULL");
    expect(cue(world, "p2")?.word).toBe("PULL");
    s.pullMilli = [0, PULL];
    expect(cue(world, "p2")?.word).toBe("HOLD");
    expect(cue(world, "p1")?.word).toBe("RUB");
  });

  it("says FIRE under the middle column on a bared core, and never the colour", () => {
    const { world, s } = lit("fire");
    expect(cue(world, "p1")).toBeNull();
    s.bared = true;
    for (const role of ["p1", "p2"] as const) {
      const said = cue(world, role);
      expect(said?.word).toBe("FIRE");
      expect(said?.x).toBeCloseTo(fieldX(LAYOUT[role], midCol(CFG)));
      expect(said?.y).toBe(LAYOUT[role].hullY);
      // The owner, 29 September 2026, every boss: a shot cue carries a clear
      // aim target (`cue-helper.ts`). The word stays at the hull, where the
      // cannon goes; the crosshair rides the thing it is fired at.
      const want = capstanCoreStanding(LAYOUT[role], CFG, s, world.beat, 0);
      expect(said?.aim?.x).toBeCloseTo(want.x, 5);
      expect(said?.aim?.y).toBeCloseTo(want.y, 5);
      expect(said?.aim?.r).toBeCloseTo(want.r, 5);
      expect(said?.aim?.y).toBeLessThan(LAYOUT[role].hullY);
    }
  });

  it("says nothing between steps", () => {
    const { world } = lit(null);
    for (const role of ["p1", "p2", "test"] as const) expect(cue(world, role)).toBeNull();
  });
});
