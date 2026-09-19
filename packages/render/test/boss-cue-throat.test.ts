import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Creature,
  createWorld,
  NO_SHELL,
  startWave,
  step,
  type ThroatState,
  throatBoss,
  throatMouthCol,
  throatMouthRow,
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
 * **THE THROAT, and the three moments it is allowed a word for**
 * (`render/src/boss-cue-read-k.ts`).
 *
 * One case was in `boss-cue-clocks.test.ts` until 19 September 2026 and it was
 * the whole of the fight the field could see: `FLING`, on any gum anywhere.
 * What that case could not catch is that the word was **true almost never** —
 * a gum flies level along the row it was on when the thumb lifted (`gum.ts`)
 * and `throatChoked` refuses one arriving on any row but the mouth's, so a
 * word standing for the twenty beats of a fall asked for a gesture that was
 * worth something on one of them.
 *
 * So the pair of cases at the top of this file is the point of the file: the
 * gum on the mouth's row, and the same gum one row above it. Everything after
 * is the two moments that were silent — the body standing in the mouth with an
 * inhale to live, and the body climbing the gullet under it.
 *
 * The states are set rather than played into, as in `boss-cue-undertow.test.ts`:
 * the clock under every one of them is proved in `sim/test/throat*.test.ts`,
 * and a test that pushed the fight through four phases to reach a lift would
 * be that suite's second copy.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

const HULL = (l: Layout) => () => l.hullY;

function opened(): { world: World; t: ThroatState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("throat");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const t = throatBoss(world);
  if (t === null) throw new Error("the throat's wave installed no boss");
  return { world, t };
}

/** Which column the mouth is under this beat — the only column that holds. */
function mouthCol(world: World, t: ThroatState): number {
  return throatMouthCol(CFG, t, world.beat);
}

/** A column the mouth is not under, for the half of a pair that misses. */
function elsewhere(world: World, t: ThroatState): number {
  return mouthCol(world, t) === 0 ? 1 : 0;
}

/** A body put on the field where the test wants it, and handed back. */
function put(world: World, kind: Creature["kind"], col: number, row: number): Creature {
  const c: Creature = {
    id: world.nextId++,
    kind,
    col,
    row,
    fromRow: row,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  } as Creature;
  world.creatures.push(c);
  return c;
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

describe("the gum, and the one row it is worth flinging from", () => {
  it("tells the pilot to fling one standing on the mouth's row", () => {
    const { world, t } = opened();
    expect(word(world, "p1")).toBeNull();
    put(world, "gum", elsewhere(world, t), throatMouthRow(CFG));
    expect(word(world, "p1")).toBe("FLING");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    // The navigator does not fling, so she is told nothing.
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing about one still falling towards it", () => {
    // The case the old reading got wrong, and the reason this file exists: a
    // thumb lifted here throws the gum along a row the mouth is not on.
    const { world, t } = opened();
    put(world, "gum", elsewhere(world, t), throatMouthRow(CFG) - 1);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing about which way or how far", () => {
    const { world, t } = opened();
    const c = put(world, "gum", elsewhere(world, t), throatMouthRow(CFG));
    const l = LAYOUT.p1;
    // On the gum itself and nowhere near the mouth: the distance and the side
    // are the pair's sentence (`docs/decisions.md` #34).
    expect(Math.abs((cue(world, "p1")?.x ?? 0) - tileCX(l, c.col))).toBeLessThan(l.tile);
    expect(Math.abs((cue(world, "p1")?.x ?? 0) - tileCX(l, mouthCol(world, t)))).toBeGreaterThan(
      l.tile / 2,
    );
  });
});

describe("a body standing in the mouth", () => {
  it("gives the shot to the navigator when he is under it", () => {
    const { world, t } = opened();
    world.cannonCol = mouthCol(world, t);
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG));
    expect(word(world, "p2")).toBe("FIRE");
    expect(cue(world, "p2")?.kind).toBe("PRESS");
    // His half of this beat is already done — the carriage is where it has to
    // be, and a word on his screen would ask for a thumb that changes no rule.
    expect(word(world, "p1")).toBeNull();
  });

  it("gives the column to the pilot when he is not", () => {
    const { world, t } = opened();
    world.cannonCol = elsewhere(world, t);
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG));
    expect(word(world, "p1")).toBe("MOVE");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    // Hers to fire once he is under it, and until then it is not her word.
    expect(word(world, "p2")).toBeNull();
  });

  it("marks the cannon and never the mouth he is wanted at", () => {
    const { world, t } = opened();
    world.cannonCol = elsewhere(world, t);
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG));
    const l = LAYOUT.p1;
    expect(Math.abs((cue(world, "p1")?.x ?? 0) - tileCX(l, world.cannonCol))).toBeLessThan(1);
    expect(Math.abs((cue(world, "p1")?.x ?? 0) - tileCX(l, mouthCol(world, t)))).toBeGreaterThan(
      l.tile,
    );
  });

  it("says nothing about a rock in it, which a shot cannot answer", () => {
    // `isWardable`: a bolt leaves a crater and not a kill, and the fall a hand
    // would drag at has already stopped. The word it is owed is a row lower.
    const { world, t } = opened();
    world.cannonCol = mouthCol(world, t);
    put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG));
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing about a body the mouth is not under", () => {
    const { world, t } = opened();
    world.cannonCol = elsewhere(world, t);
    put(world, "slick", elsewhere(world, t), throatMouthRow(CFG));
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});

describe("a rock climbing the gullet", () => {
  const climbing = (): { world: World; t: ThroatState; c: Creature } => {
    const { world, t } = opened();
    const c = put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG) + 2);
    return { world, t, c };
  };

  it("asks either thumb to brake it, on both screens", () => {
    const { world } = climbing();
    expect(word(world, "p1")).toBe("BRAKE");
    expect(word(world, "p2")).toBe("BRAKE");
    expect(cue(world, "p1")?.kind).toBe("HOLD");
    // The carry is either seat's, which `handMeans` says of every rock and
    // this reading calls rather than repeats.
    expect(cue(world, "p1")?.seat).toBeNull();
  });

  it("goes quiet the beat a hand arrives", () => {
    const { world, c } = climbing();
    world.gripP1 = c.id;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing about a living body climbing, which no hand brakes", () => {
    // A hand on a slick is the pilot's aim and drags at nothing (`grip.ts`),
    // so the word would ask for a gesture that changes no rule. It gets the
    // shot instead, one inhale later, when it reaches the mouth.
    const { world, t } = opened();
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG) + 2);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});

describe("while it everts", () => {
  it("says nothing at all, to either seat", () => {
    // The tube is turning through its own mouth: `throatChoked` refuses, the
    // hold is let go of, and every thumb the words above ask for is worth
    // nothing (`throat-pull.ts`, `throat-step.ts`).
    const { world, t } = opened();
    t.phase = "everts";
    put(world, "gum", mouthCol(world, t), throatMouthRow(CFG));
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG));
    world.cannonCol = mouthCol(world, t);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});

describe("what any of these words may say", () => {
  it("is a verb in capitals, and never a column or a colour", () => {
    const { world, t } = opened();
    world.cannonCol = elsewhere(world, t);
    put(world, "gum", mouthCol(world, t), throatMouthRow(CFG));
    put(world, "slick", mouthCol(world, t), throatMouthRow(CFG));
    put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG) + 2);
    for (const role of ["p1", "p2"] as ViewRole[]) {
      const c = cue(world, role);
      if (c === null) continue;
      expect(c.word).toMatch(/^[A-Z]+$/);
      expect(["PRESS", "HOLD", "CARRY", "TURN", "STILL"]).toContain(c.kind);
      expect(c.word).not.toMatch(/RED|CYAN|LEFT|RIGHT|[0-9]/);
    }
  });
});
