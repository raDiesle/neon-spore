import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CurtainState,
  createWorld,
  curtainBody,
  curtainBoss,
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
 * **THE CURTAIN, and the lane the two shipped words are spent in**
 * (`render/src/boss-cue-read.ts`).
 *
 * Two cases stood in `boss-cue.test.ts` until 19 September 2026 and between
 * them they said the fight was `SHOVE` on the sheet and `FIRE` on the bared
 * core. Both words are right and stand below; what neither said is the
 * **column** — `curtainStruck` is a no-op unless the shot leaves the top of
 * the core's own column, and `curtainHemStruck` only takes a lobe off in the
 * column the fabric is struck in, so the pilot's whole job was unsaid on his
 * own band. It is THE GORGE's case of the same morning
 * (`boss-cue-gorge.test.ts`).
 *
 * **A third word joined them when the rail learnt to jam.** A core hit that
 * does not end the fight pins the rail for `curtainPinBeats`, the shove is
 * refused whole, and the way back to the core is the hem carried **up** and
 * held (`sim/curtain-hand.ts`) — so `LIFT` stands on the sheet in that state
 * and `SHOVE` does not, which is one gesture per state and the whole point of
 * the cue having an arm per state.
 *
 * The states are set rather than played into:
 * the roll-back, the soft redraw, the jam and the tear are proved in
 * `sim/test/curtain*.test.ts`.
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
  const index = waveWith("curtain");
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
function installed(world: World): CurtainState {
  const c = curtainBoss(world);
  if (c === null) throw new Error("the curtain wave installed no curtain");
  return c;
}

/** The column of the first soft lobe, which is the one the pilot is reading. */
function softCol(world: World, c: CurtainState): number {
  const body = curtainBody(world, c);
  if (body === undefined) throw new Error("the fabric is gone");
  const i = c.soft[0];
  if (i === undefined) throw new Error("no lobe is soft");
  return body.col + i;
}

/** A column that is not this one, wherever in the field it sits. */
const other = (col: number): number => (col === 0 ? 1 : col - 1);

describe("THE CURTAIN", () => {
  it("asks either seat for the shove while the core is covered", () => {
    const world = opened();
    const c = installed(world);
    world.cannonCol = softCol(world, c);
    expect(word(world, "p1")).toBe("SHOVE");
    expect(word(world, "p2")).toBe("SHOVE");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
  });

  it("asks the pilot for the hem's column first, and never says which lobe to her", () => {
    const world = opened();
    const c = installed(world);
    world.cannonCol = other(softCol(world, c));
    const his = cue(world, "p1");
    expect(his?.word).toBe("MOVE");
    expect(his?.kind).toBe("CARRY");
    // On his own ship, on the hull: the soft set is his picture alone
    // (`showsCurtainSoft`), and saying which lobe is the sentence the fight
    // is made of.
    expect(his?.y).toBe(LAYOUT.p1.hullY);
    // Hers is the shove, on the same beat, because that is the other thumb.
    expect(word(world, "p2")).toBe("SHOVE");
  });

  it("says nothing about the hem once no lobe is soft", () => {
    const world = opened();
    const c = installed(world);
    world.cannonCol = other(softCol(world, c));
    c.soft = [];
    expect(word(world, "p1")).toBe("SHOVE");
  });

  it("asks the navigator alone for the shot once the core is bare and he is under it", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "torn";
    c.phaseBeat = world.beat;
    world.cannonCol = c.coreCol;
    expect(word(world, "p2")).toBe("FIRE");
    // The pilot is not drawn the shadow, so he is not drawn a mark on it.
    expect(word(world, "p1")).toBeNull();
  });

  it("holds her shot back while the cannon is out of the core's column", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "torn";
    c.phaseBeat = world.beat;
    world.cannonCol = other(c.coreCol);
    // THE THROAT's pairing: a `FIRE` up a lane `curtainStruck` refuses is
    // worse than no word, so it waits behind his column.
    expect(word(world, "p1")).toBe("MOVE");
    expect(word(world, "p2")).toBeNull();
  });

  it("asks the pilot for the hem once a hit has jammed the rail", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "pinned";
    c.phaseBeat = world.beat;
    world.cannonCol = softCol(world, c);
    // No shove moves a jammed rail, so the word on the sheet is the other
    // gesture and it is the pilot's alone (`sim/curtain-hand.ts`).
    expect(word(world, "p1")).toBe("LIFT");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    // And she is not told to shove a sheet that will not go.
    expect(word(world, "p2")).toBeNull();
  });

  it("asks her for the shot while the hem is held at the top", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "pinned";
    c.phaseBeat = world.beat;
    c.liftMilli = CFG.curtainLiftMilli;
    world.cannonCol = c.coreCol;
    // The gap over the core is open while it is held, so the fight is the
    // bare core's for as long as the thumb stays there.
    expect(word(world, "p2")).toBe("FIRE");
    expect(word(world, "p1")).toBeNull();
  });

  it("says nothing at all once the core has gone out", () => {
    const world = opened();
    const c = installed(world);
    c.phase = "out";
    c.phaseBeat = world.beat;
    world.cannonCol = c.coreCol;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});
