import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type LeadState,
  type ScuttleState,
  scuttleSocketCol,
  startWave,
  step,
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
 * **The two older choreographed bosses, and what the field is allowed to say
 * about them** — THE LEAD (`render/src/boss-cue-read-c.ts`) and THE SCUTTLE
 * (`-t.ts`), one page each since 19 September 2026. THE THROAT was a third and
 * THE LEDGER the first until each fight was read whole; their cases are in
 * `boss-cue-throat.test.ts` and `boss-cue-ledger.test.ts`.
 *
 * Half of this file is about **silence**, which is the unusual thing to test
 * and the reason it is worth a file. Each of these fights is a number the pair
 * says out loud — where the cord roots next, where the body will be when the
 * shot lands — and a cue that lit at the right moment would answer it. So THE
 * LEAD's column has a case here asserting that **nothing is drawn**, and that
 * case is the one that would catch a lane making this boss "clearer" by taking
 * its subject away (`decisions.md` #34,
 * *reconsider if a cue starts carrying a column, a colour or a count*).
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function opened(kind: Parameters<typeof waveWith>[0], beats = 1): World {
  const world = createWorld(CFG, 5);
  const index = waveWith(kind);
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

/**
 * The boss this wave installed, as the state its own file names it.
 *
 * The cast is the point of the helper and not a shortcut around it: every one
 * of these has an `xxxBoss` narrower in `packages/sim`, and four imports to
 * narrow four unions in a test that then writes to all of them would be longer
 * than the fights it is about. The `kind` check is what makes
 * it safe — a wave that installed the wrong boss throws here rather than
 * passing a test with no boss in it.
 */
function installed<T>(world: World, kind: string): T {
  const b = world.boss;
  if (b === null || b.kind !== kind) throw new Error(`the ${kind} wave installed no ${kind}`);
  return b as unknown as T;
}

describe("THE LEAD", () => {
  it("is silent while the pair is working out where the body will be", () => {
    const world = opened("lead");
    const s = installed<LeadState>(world, "lead");
    s.segments = 4;
    s.passBeat = -1;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("names the beam on the last pass, when the trigger has quietly stopped working", () => {
    const world = opened("lead");
    const s = installed<LeadState>(world, "lead");
    s.segments = 1;
    s.passBeat = world.beat;
    expect(word(world, "p2")).toBe("BURN");
    expect(cue(world, "p2")?.kind).toBe("HOLD");
    expect(word(world, "p1")).toBeNull();
  });

  it("offers her the stalk while it stands dead, where nothing else touches it", () => {
    const world = opened("lead");
    const s = installed<LeadState>(world, "lead");
    s.segments = 1;
    s.stillBeat = world.beat;
    // Four beats of a refused bolt and a beam the plating answers
    // (`sim/lead-shot.ts`) — and since 19 September 2026 the one state of this
    // fight a thumb may reach into, so the word is the gesture's own name
    // rather than `STILL`, which named a state the picture already drew
    // (`lead-word.ts`). It stands on the body, which is drawn at `s.col` on
    // her screen alone (`lead-shape.ts`).
    const hers = cue(world, "p2");
    expect(hers?.word).toBe("HOLD");
    expect(hers?.kind).toBe("HOLD");
    expect(hers?.x).toBe(tileCX(LAYOUT.p2, s.col));
    // His four beats are the stalk's: from the beat she takes it, and on the
    // last of a still nobody took, it leans the way the pass will go, which is
    // his picture and his to say (`settleLean`).
    expect(word(world, "p1")).toBeNull();
  });

  it("says no column to the pilot at any point, because its absence is the column", () => {
    const world = opened("lead");
    const s = installed<LeadState>(world, "lead");
    // Pacing, running, forecasting, still and passing: he is never shown where
    // the body is (`showsLeadCol`), so a `MOVE` going out as he arrived would
    // hand him the one term of the sum that is hers (`decisions.md` #34).
    for (const segments of [5, 4, 2, 1]) {
      s.segments = segments;
      s.stillBeat = -1;
      s.passBeat = -1;
      world.cannonCol = s.col === 0 ? 1 : 0;
      expect(word(world, "p1")).toBeNull();
    }
    s.segments = 1;
    s.passBeat = world.beat;
    expect(word(world, "p1")).toBeNull();
  });
});

describe("THE SCUTTLE", () => {
  /** Socket 1 hanging and live, with the cannon wherever the case wants it. */
  function hanging(at?: number): { world: World; s: ScuttleState; col: number } {
    const world = opened("scuttle", 3);
    const s = installed<ScuttleState>(world, "scuttle");
    s.live = 1;
    s.loose = [1];
    s.windBeat = -1;
    s.downBeat = -1;
    const col = scuttleSocketCol(CFG, 1);
    world.cannonCol = at ?? col;
    return { world, s, col };
  }

  it("marks the live part while one hangs, and the beam when it winds up", () => {
    const { world, s } = hanging();
    expect(word(world, "p2")).toBe("FIRE");

    s.windBeat = world.beat;
    expect(word(world, "p2")).toBe("BURN");
  });

  it("offers her no bolt she cannot spend, and tells him nothing either way", () => {
    const { world, col } = hanging(0);
    // A bolt leaves the cannon's column, and `scuttleStruck` is unsaid in any
    // other one, so the verb waits. The lock is still drawn, so the window she
    // is racing is not taken away with it (`scuttle-draw.ts`).
    expect(word(world, "p2")).toBeNull();
    // And the live socket is hers alone (`showsScuttleLive`): a `MOVE` here
    // would be her lock on his screen, and its silence the same leak by
    // subtraction, so he is told nothing at either position.
    expect(word(world, "p1")).toBeNull();
    world.cannonCol = col;
    expect(word(world, "p2")).toBe("FIRE");
    expect(word(world, "p1")).toBeNull();
  });

  it("sends him to the last part's column, the only column his slab has left", () => {
    const { world, s, col } = hanging(col0(scuttleSocketCol(CFG, 1)));
    s.windBeat = world.beat;
    // One part left is what the wind-up *is*, so the slab he is shown has one
    // plate on it and nothing is subtracted by naming its column
    // (`showsScuttleCount`). The window is the fill and a beat of slack, all of
    // which her beam is spending.
    const his = cue(world, "p1");
    expect(his?.word).toBe("MOVE");
    expect(his?.kind).toBe("CARRY");
    expect(his?.x).toBe(tileCX(LAYOUT.p1, world.cannonCol));
    expect(word(world, "p2")).toBe("BURN");
    // Standing there already, there is nothing to say to him and her fill is
    // still the whole of what is left.
    world.cannonCol = col;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBe("BURN");
  });
  it("offers him a carry on a part one column off, and nothing once he stands under one", () => {
    const { world, s, col } = hanging();
    // A part one column off is a bolt he can buy without sliding the cannon at
    // all, and both facts the mark is read from — his cannon, and every
    // hanging part in grey (`showsScuttleCount`) — are already on his screen.
    world.cannonCol = col + 1;
    const his = cue(world, "p1");
    expect(his?.word).toBe("MOVE");
    expect(his?.kind).toBe("CARRY");
    expect(his?.x).toBe(tileCX(LAYOUT.p1, col));
    // Two columns off no carry reaches, and over the part itself there is
    // nothing left to buy — the column is already his.
    world.cannonCol = col + 2;
    expect(word(world, "p1")).toBeNull();
    world.cannonCol = col;
    expect(word(world, "p1")).toBeNull();
    // And it is spent once a cycle, so a part already carried is not offered.
    world.cannonCol = col + 1;
    s.swung = 1;
    s.swungCol = col;
    expect(word(world, "p1")).toBeNull();
  });
});

/** Any column but this one, for a case about the cannon being in the wrong place. */
function col0(col: number): number {
  return col === 0 ? 1 : 0;
}
