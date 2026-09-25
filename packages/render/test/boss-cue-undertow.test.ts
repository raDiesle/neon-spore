import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type UndertowBreach,
  type UndertowState,
  undertowBoss,
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
 * **THE UNDERTOW, and the word each of its five phases says**
 * (`render/src/boss-cue-read-j.ts`).
 *
 * Three of these cases were in `boss-cue.test.ts` until 18 September 2026 and
 * came here with the reading; the fight is still in the sweep at the foot of
 * that file, which is about what a cue may *contain* and wants every boss in
 * it.
 *
 * What they were missing is a column. The maw takes from the cannon's own
 * column and the beam burns it (`undertow-press.ts`, `lance-burn.ts`), and
 * the old reading said `OPEN` and `BURN` on any standing lobe wherever the
 * cannon was — a word asking for a thumb that would have done nothing. So
 * almost every case below is a pair: the lobe under him, and the same lobe
 * five columns away.
 *
 * The states are set rather than played into: every clock under them is
 * proved in `sim/test/undertow*.test.ts`, and a test that pushed the fight
 * through four phases to reach the rise would be that suite's second copy.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

const HULL = (l: Layout) => () => l.hullY;

function opened(): { world: World; u: UndertowState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("undertow");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const u = undertowBoss(world);
  if (u === null) throw new Error("the undertow's wave installed no boss");
  return { world, u };
}

/** A column away from wherever the carriages are parked, which is the middle. */
function elsewhere(world: World): number {
  return world.cannonCol === 0 ? 1 : 0;
}

function breach(world: World, col: number, over: Partial<UndertowBreach> = {}): UndertowBreach {
  return {
    col,
    stage: "standing",
    stageBeat: world.beat,
    tall: false,
    widthMilli: 0,
    widened: false,
    ...over,
  };
}

/** The word this seat is given, or nothing. */
function word(world: World, role: ViewRole): string | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, HULL(l))?.word ?? null;
}

/** The whole cue this seat is given. */
function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, HULL(l));
}

describe("a lobe standing under the cannon", () => {
  it("gives the maw to the pilot and the beam to the navigator", () => {
    const { world, u } = opened();
    // Both carriages start in the middle, and a plate over the lobe is its own
    // case below — park hers out of the way so this one is about the lobe.
    world.shieldCol = elsewhere(world);
    u.breaches.push(breach(world, world.cannonCol));
    expect(word(world, "p1")).toBe("SUCK");
    expect(cue(world, "p1")?.kind).toBe("HOLD");
    // Nothing for her: the maw is his alone, and a word on her screen this
    // beat would be the fight asking for a thumb that changes no rule.
    expect(word(world, "p2")).toBeNull();

    const tall = opened();
    tall.world.shieldCol = elsewhere(tall.world);
    tall.u.breaches.push(breach(tall.world, tall.world.cannonCol, { tall: true }));
    expect(word(tall.world, "p2")).toBe("SHOOT");
    expect(cue(tall.world, "p2")?.kind).toBe("HOLD");
    expect(word(tall.world, "p1")).toBeNull();
  });
});

describe("a lobe standing somewhere else", () => {
  /**
   * The case the reading was missing. Both of the things that reach a lobe
   * fire up the cannon's own column, so a lobe five columns away is a word
   * for the pilot and for nobody else — whichever seat would have answered it
   * from underneath.
   */
  it("asks the pilot for the column before it asks either seat for the shot", () => {
    const { world, u } = opened();
    u.breaches.push(breach(world, elsewhere(world)));
    expect(word(world, "p1")).toBe("MOVE");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    expect(word(world, "p2")).toBeNull();

    const tall = opened();
    tall.u.breaches.push(breach(tall.world, elsewhere(tall.world), { tall: true }));
    // Hers to burn, once he is under it — and until then it is not her word.
    expect(word(tall.world, "p1")).toBe("MOVE");
    expect(word(tall.world, "p2")).toBeNull();
  });

  it("marks the cannon and never the lobe he is wanted at", () => {
    const { world, u } = opened();
    const col = elsewhere(world);
    u.breaches.push(breach(world, col));
    const c = cue(world, "p1");
    const l = LAYOUT.p1;
    // Inside the cannon's own tile, and nowhere near the lobe's: the field
    // says the verb and the pair say the column (`docs/decisions.md` #34).
    expect(Math.abs((c?.x ?? 0) - tileCX(l, world.cannonCol))).toBeLessThan(1);
    expect(Math.abs((c?.x ?? 0) - tileCX(l, col))).toBeGreaterThan(l.tile);
  });
});

describe("the shield in the way", () => {
  it("tells the navigator to move a shield that is keeping the maw off a lobe", () => {
    const { world, u } = opened();
    u.breaches.push(breach(world, world.shieldCol));
    expect(word(world, "p2")).toBe("MOVE");
    // The pilot still has his own half of the same beat: the maw is a window
    // and not a shot, so the beat she clears the column he is already open.
    expect(word(world, "p1")).toBe("SUCK");
  });

  it("says nothing to her about a plate that is not on a lobe's column", () => {
    const { world, u } = opened();
    u.breaches.push(breach(world, elsewhere(world)));
    expect(world.shieldCol).not.toBe(elsewhere(world));
    expect(word(world, "p2")).toBeNull();
  });
});

describe("the seat coming up under him", () => {
  it("tells the pilot to slide off the plate while it is still bowing", () => {
    const { world, u } = opened();
    u.phase = "seat";
    u.breaches.push(breach(world, world.cannonCol, { stage: "bowing" }));
    expect(word(world, "p1")).toBe("MOVE");
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing about a bow he is not sitting on", () => {
    const { world, u } = opened();
    u.phase = "seat";
    u.breaches.push(breach(world, elsewhere(world), { stage: "bowing" }));
    expect(word(world, "p1")).toBeNull();
  });

  /**
   * Rule one, in the one place the old reading broke it: `undertowUnseats`
   * swallows every verb of his that reaches the ship for the whole of it, so
   * `MOVE` there was the field asking for the one thing he cannot do.
   */
  it("goes quiet once the seat has him", () => {
    const { world, u } = opened();
    u.unseatedUntil = world.beat + 2;
    u.breaches.push(breach(world, world.cannonCol));
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});

describe("the last lobe", () => {
  it("gives the pilot the rise to carry the cannon to the middle", () => {
    const { world, u } = opened();
    u.phase = "last";
    // The body comes up dead centre (`undertowLastCol`), and the whole edge
    // bows for `undertowRiseBeats` first: that lift is the time he has to be
    // there, and it was the one phase the reading said nothing in.
    const middle = world.cannonCol;
    world.cannonCol = elsewhere(world);
    u.breaches.push(breach(world, middle, { stage: "bowing" }));
    expect(word(world, "p1")).toBe("MOVE");
    expect(word(world, "p2")).toBeNull();
  });

  it("asks him to hold the maw open on it, and asks her nothing at all", () => {
    const { world, u } = opened();
    u.phase = "last";
    u.breaches.push(breach(world, world.cannonCol));
    expect(word(world, "p1")).toBe("SUCK");
    // Her plate is on the same column and she is still told nothing:
    // `undertowTake` refuses in this phase, so moving it changes no rule.
    expect(world.shieldCol).toBe(world.cannonCol);
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing once the body is in", () => {
    const { world, u } = opened();
    u.phase = "taken";
    u.breaches.push(breach(world, world.cannonCol));
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});
