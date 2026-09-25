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
import { throatTubeCircle } from "../src/throat-grip.js";
import { rings } from "../src/throat-shape.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE THROAT, and the four moments it is allowed a word for**
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
 * is the three moments that were silent — the body standing in the mouth with
 * an inhale to live, the *rock* standing in it that no shot answers, and the
 * body climbing the gullet under them.
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

  it("tells the pilot to wait for one still falling towards it", () => {
    // The case the old reading got wrong, and the reason this file exists: a
    // thumb lifted here throws the gum along a row the mouth is not on. It was
    // silence until the owner could not tell what to do with it (25 September
    // 2026), so it is `WAIT` now — never `FLING` — and still his alone.
    const { world, t } = opened();
    put(world, "gum", elsewhere(world, t), throatMouthRow(CFG) - 1);
    expect(word(world, "p1")).toBe("WAIT");
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

  it("says nothing about a body the mouth is not under", () => {
    const { world, t } = opened();
    world.cannonCol = elsewhere(world, t);
    put(world, "slick", elsewhere(world, t), throatMouthRow(CFG));
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });
});

/**
 * **The rock standing in the mouth, which a shot cannot answer** — the hole
 * the gullet's own two handles fill (`throat-hand.ts`). A bolt at a warded
 * body leaves a crater and not a kill, and the hand that would drag at its
 * fall has nothing left to drag at: until 19 September 2026 the honest answer
 * was silence, and now the answer is the phase.
 */
describe("a rock the mouth already has", () => {
  /** The fight put in a phase, with a rock standing in the mouth of it. */
  function warded(phase: ThroatState["phase"], slack: number) {
    const { world, t } = opened();
    t.slack = slack;
    t.phase = phase;
    t.phaseBeat = world.beat;
    world.cannonCol = mouthCol(world, t);
    put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG));
    return { world, t };
  }

  it("asks the navigator to pinch a slack ring while the mouth is still travelling", () => {
    // The cinch stops the inhale and never the mouth, so in a phase with a
    // stride the frozen beats are the mouth sliding off the body.
    const { world } = warded("slide", 1);
    expect(word(world, "p2")).toBe("CINCH");
    expect(cue(world, "p2")?.kind).toBe("HOLD");
    expect(cue(world, "p2")?.seat).toBe(2);
    // Not his: there is one thumb on the ring and it is hers (`ringHeard`).
    expect(word(world, "p1")).toBeNull();
  });

  it("stands the pinch on the lowest ring, which is the slack one", () => {
    const { world, t } = warded("quick", 2);
    const l = LAYOUT.p2;
    const low = rings(l, CFG, t, world.beat, 0)[CFG.throatRings - 1];
    expect(Math.abs((cue(world, "p2")?.x ?? 0) - (low?.x ?? -999))).toBeLessThan(1);
    expect(Math.abs((cue(world, "p2")?.y ?? 0) - (low?.y ?? -999))).toBeLessThan(1);
  });

  it("goes quiet once her thumb is on one, and while the borrowed beats are owed", () => {
    const { world, t } = warded("slide", 1);
    t.cinchBeat = world.beat;
    expect(word(world, "p2")).toBeNull();
    t.cinchBeat = -1;
    t.breath = 1;
    expect(word(world, "p2")).toBeNull();
  });

  it("asks the pilot to haul the tube once the mouth has stopped coming to them", () => {
    // `open` inhales every beat and its stride is zero: a pinched ring buys
    // nothing there, and the only answer left is to take the mouth off the body.
    const { world, t } = warded("open", CFG.throatRings - 1);
    expect(word(world, "p1")).toBe("HAUL");
    expect(cue(world, "p1")?.kind).toBe("CARRY");
    expect(cue(world, "p1")?.seat).toBe(1);
    expect(word(world, "p2")).toBeNull();
    // On the ring his thumb goes to, which hangs a tile under the lip rather
    // than on it: the word and the handle are one answer now
    // (`throat-grip.ts`), and a mark left on the mouth would be pointing at
    // the one place there is nothing to take hold of.
    const l = LAYOUT.p1;
    const at = throatTubeCircle(l, CFG, t, world.beat, 0);
    expect(Math.abs((cue(world, "p1")?.x ?? 0) - at.x)).toBeLessThan(1);
    expect(Math.abs((cue(world, "p1")?.y ?? 0) - at.y)).toBeLessThan(1);
  });

  it("goes quiet the beat a carry has already asked the mouth to move", () => {
    const { world, t } = warded("open", CFG.throatRings - 1);
    t.haulStep = 1;
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("says nothing at all before a ring has been choked", () => {
    // `still`: nothing to pinch and nothing to haul, and the old silence is
    // still the true one — the answer to this rock is a gum, next phase.
    const { world } = warded("still", 0);
    expect(word(world, "p1")).toBeNull();
    expect(word(world, "p2")).toBeNull();
  });

  it("is one word however many rocks are standing in the mouth", () => {
    const { world, t } = warded("slide", 1);
    put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG));
    put(world, "meteor", mouthCol(world, t), throatMouthRow(CFG));
    expect(word(world, "p2")).toBe("CINCH");
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
