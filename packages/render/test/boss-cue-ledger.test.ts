import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type LedgerState,
  ledgerBoss,
  ledgerSeamCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, tileCX, type ViewRole } from "../src/layout.js";
import { ledgerSeamX } from "../src/ledger-shape.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE LEDGER, and the column nobody was naming**
 * (`render/src/boss-cue-read-o.ts`).
 *
 * Three cases stood in `boss-cue-clocks.test.ts` until 19 September 2026 and
 * they were all about the half of this fight that happens *after* a shot: the
 * return coming down the cord and the socket it lands in. Both words are right
 * and stand below. What none of them covered is the shot itself — the seam is
 * one column of eleven, the two either side of it are the body's own plating
 * (`ledgerCovers`, `ledgerRefused`), and a bolt leaves the cannon's own column,
 * so the fight has a column the pilot must park on and the field never said so.
 * That was the pilot's first line in the guide and nowhere else.
 *
 * The other half of this file is **silence**, which is the unusual thing to
 * assert and the reason these cases are worth keeping. Two of this fight's
 * three movements are built on something the field must not say: the last
 * return is the one bill the pair has to let through, and from
 * `ledgerWhipSeam` hits whether to spend a shot on the body at all is the
 * question the design put in step 8. A lane making this boss "clearer" by
 * lighting either would be caught here (`decisions.md` #34).
 *
 * The states are set rather than played into, as in `boss-cue-candle.test.ts`:
 * the seam, the cadence, the walk and the tear are proved in
 * `sim/test/ledger*.test.ts`.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, () => l.hullY);
}

function word(world: World, role: ViewRole): string | null {
  return cue(world, role)?.word ?? null;
}

/** The cord in and nothing on it: the movement a shot is owed in. */
function paying(): { world: World; t: LedgerState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("ledger");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 6 * TPB; i++) step(world, []);
  const t = ledgerBoss(world);
  if (t === null) throw new Error("the ledger wave rooted no cord");
  t.rootBeat = world.beat - CFG.ledgerRootBeats;
  t.beads = [];
  return { world, t };
}

/** The same, with one return on its way down. */
function coming(): { world: World; t: LedgerState } {
  const { world, t } = paying();
  t.beads = [{ beat: world.beat + 2, span: 4, last: false, pulled: false }];
  return { world, t };
}

describe("THE LEDGER's words", () => {
  it("puts the trigger on the pilot and the plate on the navigator", () => {
    const { world, t } = coming();
    t.socket = world.shieldCol === 0 ? 1 : 0;
    expect(word(world, "p1")).toBe("SHIELD");
    expect(word(world, "p2")).toBe("MOVE");
  });

  it("stops asking her to move once the plate is where the cord roots", () => {
    const { world, t } = coming();
    t.socket = world.shieldCol;
    expect(word(world, "p2")).toBeNull();
    expect(word(world, "p1")).toBe("SHIELD");
  });

  it("asks him for the seam's column while the cord is empty", () => {
    const { world, t } = paying();
    world.cannonCol = ledgerSeamCol(t, CFG) === 0 ? 1 : 0;
    const his = cue(world, "p1");
    expect(his?.word).toBe("MOVE");
    expect(his?.kind).toBe("CARRY");
    // On the cannon, which is the thing that moves and his alone to see.
    expect(his?.x).toBe(tileCX(LAYOUT.p1, world.cannonCol));
    expect(word(world, "p2")).toBeNull();
  });

  it("asks her to fire once the cannon is under the seam, and says no colour", () => {
    const { world, t } = paying();
    world.cannonCol = ledgerSeamCol(t, CFG);
    const hers = cue(world, "p2");
    expect(hers?.word).toBe("FIRE");
    expect(hers?.kind).toBe("PRESS");
    // On the seam down the body's middle, not on a flanking column the plating
    // would refuse the bolt from.
    expect(hers?.x).toBe(ledgerSeamX(LAYOUT.p2, CFG, t));
    expect(word(world, "p1")).toBeNull();
  });

  it("says nothing about the last return, which is the one they must not ward", () => {
    const { world, t } = coming();
    t.beads = [{ beat: world.beat + 2, span: 4, last: true, pulled: false }];
    t.socket = world.shieldCol === 0 ? 1 : 0;
    // Her `MOVE` goes with it: a word about the socket on the beat the plate is
    // meant to be leaving it is worse than none.
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("stops asking for the seam once the cord bills every shot", () => {
    const { world, t } = paying();
    world.cannonCol = ledgerSeamCol(t, CFG) === 0 ? 1 : 0;
    t.seam = CFG.ledgerWhipSeam;
    // From here a warded return widens the seam for nothing and every bolt
    // starts one, so which shot to spend is the pair's question and not the
    // field's (`ledgerBills`, `ledger-step.ts`).
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("asks her for the cord's foot while it is still going in, and him for nothing", () => {
    const { world, t } = paying();
    world.cannonCol = ledgerSeamCol(t, CFG);
    t.rootBeat = world.beat;
    // The body cannot be hurt yet and no return is owed, so the one thing
    // either seat can do in this movement is walk the foot along the plating
    // before it seats (`sim/ledger-hand.ts`).
    const hers = cue(world, "p2");
    expect(hers?.word).toBe("ROOT");
    expect(hers?.kind).toBe("CARRY");
    expect(word(world, "p1")).toBeNull();
    t.rootBeat = world.beat - CFG.ledgerRootBeats;
    t.outBeat = world.beat;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("offers him the return itself once the cord whips and the plate is already there", () => {
    const { world, t } = coming();
    t.socket = world.shieldCol;
    t.seam = CFG.ledgerWhipSeam;
    // A warded return is the weapon from here, and the pair is ahead of the
    // cord: the bead is worth hauling down rather than waiting for.
    const his = cue(world, "p1");
    expect(his?.word).toBe("PULL");
    expect(his?.kind).toBe("PRESS");
    // And it goes back to the trigger on the beat it lands, which is the one
    // word that has ever stood on a bead.
    t.beads = [{ beat: world.beat + 1, span: 4, last: false, pulled: false }];
    expect(word(world, "p1")).toBe("SHIELD");
  });
});
