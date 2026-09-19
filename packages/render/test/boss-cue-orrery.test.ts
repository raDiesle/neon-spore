import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type OrreryState,
  orreryCoreCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
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
 * **THE ORRERY, and the one moment it had no word for**
 * (`render/src/boss-cue-read-l.ts`).
 *
 * Two cases were in `boss-cue-clocks.test.ts` until 19 September 2026, and
 * between them they said the fight was one word long: silence while the rings
 * turn, `BURN` once they are all off. The silence is right and the first case
 * below is that case unchanged — the beat every gap stands at the bottom is
 * the whole boss, and a field that lit on it would leave the pair nothing to
 * agree about.
 *
 * What neither case could catch is the **column**. A bolt and the beam both
 * leave the cannon's own column (`fire.ts`), the core hangs over exactly one
 * for the whole fight (`orreryCoreCol`), and `spitting` spends itself trying
 * to drive the pilot off it (`orrery-step.ts`) — and nothing on his band said
 * so. That is `MOVE`, and it is the rest of this file.
 *
 * The states are set rather than played into, as in `boss-cue-throat.test.ts`:
 * the clock under the rings is proved in `sim/test/orrery*.test.ts`, and a
 * test that turned three rings to reach a naked core would be that suite's
 * second copy.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(beats = 1): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("orrery");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < beats * TPB; i++) step(world, []);
  return world;
}

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

function word(world: World, role: ViewRole): string | null {
  return cue(world, role)?.word ?? null;
}

/** The boss this wave installed. `boss-cue-clocks.test.ts` says why the cast. */
function installed(world: World): OrreryState {
  const b = world.boss;
  if (b === null || b.kind !== "orrery") throw new Error("the orrery wave installed no orrery");
  return b as unknown as OrreryState;
}

describe("THE ORRERY", () => {
  it("is silent while the rings turn — the open beat is the whole boss", () => {
    const world = opened();
    const b = installed(world);
    b.phase = "rings";
    // Every beat of a full orbit, so a cue that lit on the open one is caught
    // wherever in the cycle this world happens to have started. The carriage
    // is parked on the core's column throughout, which is where a world starts
    // it (`world-ship.ts`) and the only place this fight has nothing to say.
    for (let i = 0; i < 24; i++) {
      // Held, so a boss the step nulled cannot make this pass by saying
      // nothing about a fight that is over.
      expect(world.boss?.kind).toBe("orrery");
      expect(world.cannonCol).toBe(orreryCoreCol(CFG));
      expect(word(world, "p1")).toBeNull();
      expect(word(world, "p2")).toBeNull();
      for (let t = 0; t < TPB; t++) step(world, []);
      b.phase = "rings";
    }
  });

  it("names the beam once every ring is off", () => {
    const world = opened();
    const b = installed(world);
    b.phase = "naked";
    expect(word(world, "p2")).toBe("BURN");
    expect(word(world, "p1")).toBeNull();
  });

  it("asks the pilot back onto the core's column, and only him", () => {
    const world = opened();
    const b = installed(world);
    b.phase = "rings";
    world.cannonCol = orreryCoreCol(CFG) + 1;
    expect(word(world, "p1")).toBe("MOVE");
    expect(word(world, "p2")).toBeNull();
  });

  it("puts the mark on the carriage and never on the core", () => {
    const world = opened();
    const b = installed(world);
    b.phase = "rings";
    world.cannonCol = orreryCoreCol(CFG) + 1;
    const mark = cue(world, "p1");
    // The hull line, which is where the thumb that answers this goes. A frame
    // around the core saying `MOVE` would be the field naming the column —
    // the one sentence this fight is made of (`boss-cue-read-l.ts`).
    expect(mark?.y).toBe(LAYOUT.p1.hullY);
  });

  it("withholds the beam while the carriage is off the column", () => {
    const world = opened();
    const b = installed(world);
    b.phase = "naked";
    world.cannonCol = orreryCoreCol(CFG) + 1;
    // One gesture across two seats: a `BURN` up an empty lane is the field
    // asking her for a shot that cannot land.
    expect(word(world, "p1")).toBe("MOVE");
    expect(word(world, "p2")).toBeNull();
  });

  it("goes quiet on the beam while the lobe is already filling", () => {
    const world = opened();
    const b = installed(world);
    b.phase = "naked";
    world.prime = { tick: world.tick, color: "red", spent: false };
    // `gripBrakes`' rule: a word over something already being answered teaches
    // the pair to stop reading the words.
    expect(word(world, "p2")).toBeNull();
    expect(word(world, "p1")).toBeNull();
  });

  it("says nothing at all once the core is out", () => {
    const world = opened();
    const b = installed(world);
    b.phase = "out";
    world.cannonCol = orreryCoreCol(CFG) + 1;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});
