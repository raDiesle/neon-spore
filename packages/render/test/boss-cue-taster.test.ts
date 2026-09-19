import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type TasterState,
  tasterBoss,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE TASTER, and the three things a column answers**
 * (`render/src/boss-cue-read-b.ts`).
 *
 * One case stood in `boss-cue.test.ts` until 19 September 2026 and it said the
 * fight was `SHEAR` while a blade stood and `BURN` once the fan closed. Both
 * words are right and stand below; what neither said is that a shot is read off
 * the column it leaves in (`tasterBladeAt`), and that the crest has **three**
 * of them — a standing blade to shear, the soft crest where one used to be, and
 * a blade still growing where the shot is spent. The soft crest is the one the
 * field said nothing about at all, and `tasterCrestCuts` of them are what stop
 * the fan re-edging (`tasterLift`), which is the answer to the third movement.
 *
 * The old case set blade 0 standing with the cannon at the middle of the field,
 * so its `SHEAR` was a word about a lane eleven columns wide that happened to
 * contain one. It sets the cannon now.
 *
 * The states are set rather than played into, as in `boss-cue-candle.test.ts`:
 * the grow, the set and the re-edge are proved in `sim/test/taster*.test.ts`.
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
  const index = waveWith("taster");
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

/** The boss this wave installed. */
function installed(world: World): TasterState {
  const t = tasterBoss(world);
  if (t === null) throw new Error("the taster wave installed no taster");
  return t;
}

/** Blade `i` grown, edged and standing; the cannon put under it. */
function standing(world: World, t: TasterState, i: number): void {
  const k = t.blades[i];
  if (k === undefined) throw new Error(`no blade ${i}`);
  k.growBeat = world.beat - CFG.tasterGrowBeats;
  k.setBeat = world.beat;
  k.edge = "red";
  k.layers = 1;
  world.cannonCol = t.col + i;
}

/** Blade `i` struck off, so its column is soft crest; the cannon put under it. */
function shorn(world: World, t: TasterState, i: number): void {
  const k = t.blades[i];
  if (k === undefined) throw new Error(`no blade ${i}`);
  k.shorn = true;
  k.edge = null;
  k.layers = 0;
  t.shorn += 1;
  world.cannonCol = t.col + i;
}

describe("THE TASTER", () => {
  it("asks the navigator to shear the column the cannon is standing in", () => {
    const world = opened();
    const t = installed(world);
    standing(world, t, 0);
    expect(word(world, "p2")).toBe("SHEAR");
    expect(cue(world, "p2")?.kind).toBe("PRESS");
    expect(word(world, "p1")).toBeNull();
  });

  it("asks her to cut the crest where a blade used to be", () => {
    const world = opened();
    const t = installed(world);
    standing(world, t, 3);
    shorn(world, t, 0);
    const hers = cue(world, "p2");
    expect(hers?.word).toBe("CUT");
    expect(hers?.kind).toBe("PRESS");
    // On his own column, where the crest is already open — not on the fan's
    // middle, which is where the words about the fan as a whole stand.
    expect(hers?.x).toBe(tileCX(LAYOUT.p2, t.col));
    expect(hers?.x).not.toBe(tileCX(LAYOUT.p2, t.col + (t.blades.length - 1) / 2));
    expect(word(world, "p1")).toBeNull();
  });

  it("asks him for a column while his own has nothing that can be answered", () => {
    const world = opened();
    const t = installed(world);
    standing(world, t, 0);
    // A blade out of the crest and still colourless: a shot here is spent, and
    // the ledger counted the colour before it got there.
    const growing = t.blades[4];
    if (growing === undefined) throw new Error("no blade 4");
    growing.growBeat = world.beat;
    world.cannonCol = t.col + 4;
    expect(word(world, "p1")).toBe("MOVE");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing at the top of the fight, where no column can be answered", () => {
    const world = opened();
    const t = installed(world);
    const growing = t.blades[5];
    if (growing === undefined) throw new Error("no blade 5");
    growing.growBeat = world.beat;
    world.cannonCol = t.col + 5;
    // His own blade is growing and will stand in his own column, so the word
    // that walked THE CANDLE's pilot off his lane is not said here.
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("asks for the beam once the fan closes, from any column the crest spans", () => {
    const world = opened();
    const t = installed(world);
    standing(world, t, 0);
    t.shorn = t.blades.length - CFG.tasterClosedBlades;
    expect(word(world, "p2")).toBe("BURN");
    expect(cue(world, "p2")?.kind).toBe("HOLD");
    world.cannonCol = t.col + t.blades.length - 1;
    expect(word(world, "p2")).toBe("BURN");
    expect(word(world, "p1")).toBeNull();
  });

  it("says nothing at all once the beam has opened it", () => {
    const world = opened();
    const t = installed(world);
    standing(world, t, 0);
    t.outBeat = world.beat;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});
