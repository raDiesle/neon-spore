import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimConfig, ticksPerBeat } from "../src/config.js";
import { setGrip } from "../src/grip.js";
import { gumSwiped } from "../src/gum.js";
import { hashWorld } from "../src/hash.js";
import { slowing } from "../src/slow.js";
import { step } from "../src/step.js";
import {
  type ThroatState,
  throatBoss,
  throatEvery,
  throatInhales,
  throatMouthCol,
  throatMouthRow,
  throatRingsLeft,
  throatSnap,
  throatToInhale,
} from "../src/throat.js";
import { throatPhaseFor } from "../src/throat-step.js";
import type { Creature, CreatureKind } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * THE THROAT, and the sentence it is built to make true: **the one boss you
 * answer by giving it something** (`docs/spec/bosses-choreographed.md` §1).
 *
 * What is checked here is the arithmetic and the two opposite gestures,
 * because together they *are* the boss: that the mouth's column is a pure
 * function of the beat and can therefore be asked about a beat that has not
 * happened, that a flung gum arriving at the mouth chokes a ring for good,
 * that anything else the mouth takes re-tightens one — so the wave's own
 * arrivals heal it — that the pull is a drag a braking hand has a whole inhale
 * to answer, and that the phases only ever go forward.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HOME = midCol(CFG);
const ROW = throatMouthRow(CFG);
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 9;

function open(seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "throat" });
  return world;
}

function tube(world: World): ThroatState {
  const boss = throatBoss(world);
  if (boss === null) throw new Error("no gullet installed");
  return boss;
}

/** Beats, in ticks, with nobody pressing anything. */
function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

/** A body put on the field where a test wants it, which is what a wave's own
 * author does a beat at a time. */
function put(world: World, kind: CreatureKind, col: number, row: number): Creature {
  const c: Creature = {
    id: world.nextId++,
    kind,
    col,
    row,
    fromRow: row,
    fromCol: col,
    color: kind === "gum" || kind === "meteor" ? null : "red",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: 0,
  };
  world.creatures.push(c);
  return c;
}

describe("the gullet's shape", () => {
  it("hangs its mouth over the middle column, on a row a body can stand in", () => {
    const world = open();
    const b = tube(world);
    expect(b.mouthFrom).toBe(HOME);
    expect(throatMouthCol(CFG, b, world.beat)).toBe(HOME);
    expect(ROW).toBeGreaterThan(0);
    expect(ROW).toBeLessThan(CFG.rows - 1);
    expect(throatRingsLeft(CFG, b)).toBe(CFG.throatRings);
  });

  it("does not move at all while every ring is tight", () => {
    const world = open();
    const b = tube(world);
    for (let beat = 0; beat < 40; beat++) {
      expect(throatMouthCol(CFG, b, world.beat + beat)).toBe(HOME);
    }
  });

  it("is a fixture and not a body, so there is nothing of it on the field", () => {
    const world = open();
    expect(world.creatures).toHaveLength(0);
  });
});

describe("the mouth's travel, asked about beats that have not happened", () => {
  it("steps a column a beat and turns on the wall, never twice in one place", () => {
    const world = open();
    const b = tube(world);
    b.phase = "slide";
    b.phaseBeat = 0;
    b.mouthFrom = throatSnap(CFG, HOME, CFG.throatSlideCols);
    const walk: number[] = [];
    for (let beat = 0; beat < 2 * (CFG.cols - 1); beat++) {
      walk.push(throatMouthCol(CFG, b, beat));
    }
    // Inside the field, a column a beat, and never the same column twice
    // running — `cross.ts`'s own promise, which is why the reflection is over
    // the last whole stride rather than over the wall.
    expect(Math.min(...walk)).toBe(0);
    expect(Math.max(...walk)).toBe(CFG.cols - 1);
    for (let i = 1; i < walk.length; i++) {
      expect(Math.abs(walk[i]! - walk[i - 1]!)).toBe(CFG.throatSlideCols);
    }
  });

  it("steps two at a time once the tube has tightened, and still lands on both walls", () => {
    const world = open();
    const b = tube(world);
    b.phase = "quick";
    b.phaseBeat = 0;
    b.mouthFrom = throatSnap(CFG, HOME, CFG.throatQuickCols);
    const walk: number[] = [];
    for (let beat = 0; beat < 40; beat++) walk.push(throatMouthCol(CFG, b, beat));
    expect(walk).toContain(0);
    expect(walk).toContain(CFG.cols - 1);
    for (let i = 1; i < walk.length; i++) {
      expect(Math.abs(walk[i]! - walk[i - 1]!)).toBe(CFG.throatQuickCols);
    }
  });

  it("answers the same for a beat before its anchor as for one after", () => {
    const world = open();
    const b = tube(world);
    b.phase = "slide";
    b.phaseBeat = 100;
    b.mouthFrom = 0;
    // The one thing a stepper could not do, and player 2's whole readout is
    // this question: where will it be, and where was it.
    expect(throatMouthCol(CFG, b, 99)).toBe(1);
    expect(throatMouthCol(CFG, b, 101)).toBe(1);
  });
});

describe("the inhale, which is the number player 2 says out loud", () => {
  it("comes round every throatInhaleBeats from the phase's own origin", () => {
    const world = open();
    const b = tube(world);
    b.phaseBeat = 7;
    const every = CFG.throatInhaleBeats;
    expect(throatEvery(CFG, b)).toBe(every);
    expect(throatInhales(CFG, b, 7)).toBe(true);
    expect(throatInhales(CFG, b, 7 + every)).toBe(true);
    for (let k = 1; k < every; k++) expect(throatInhales(CFG, b, 7 + k)).toBe(false);
  });

  it("counts down to the next one, and reads 0 on it", () => {
    const world = open();
    const b = tube(world);
    b.phaseBeat = 0;
    expect(throatToInhale(CFG, b, 0)).toBe(0);
    expect(throatToInhale(CFG, b, 1)).toBe(CFG.throatInhaleBeats - 1);
    expect(throatToInhale(CFG, b, CFG.throatInhaleBeats - 1)).toBe(1);
  });

  it("tightens with the rings and goes to every beat when the tube cannot close", () => {
    const world = open();
    const b = tube(world);
    b.phase = "quick";
    expect(throatEvery(CFG, b)).toBe(CFG.throatTightBeats);
    b.phase = "open";
    expect(throatEvery(CFG, b)).toBe(1);
    b.phase = "everts";
    expect(throatInhales(CFG, b, b.phaseBeat)).toBe(false);
  });
});

describe("what the mouth does to a body standing in its column", () => {
  it("stops it falling and hauls it a row closer on each inhale", () => {
    const world = open();
    const b = tube(world);
    const rock = put(world, "meteor", HOME, ROW + 3);
    b.phaseBeat = world.beat;
    // A beat that is not an inhale: caught, and going nowhere.
    beats(world, 1);
    expect(rock.row).toBe(ROW + 3);
    // And the inhale beat, which lifts it one row and no more.
    beats(world, CFG.throatInhaleBeats - 1);
    expect(rock.row).toBe(ROW + 2);
  });

  it("lets it fall again the moment the mouth is somewhere else", () => {
    const world = open();
    const b = tube(world);
    const rock = put(world, "meteor", HOME + 2, ROW + 1);
    b.phaseBeat = world.beat;
    beats(world, 1);
    // Two columns off the mouth: the throat never had hold of it, so it fell.
    expect(rock.row).toBe(ROW + 2);
  });

  it("gives a braking hand a whole inhale to arrive, which is THE DRAG", () => {
    const world = open();
    const b = tube(world);
    const rock = put(world, "meteor", HOME, ROW + 2);
    b.phaseBeat = world.beat;
    setGrip(world, 1, rock.id);
    beats(world, CFG.throatInhaleBeats);
    // A hand on it and the inhale came and went: it is exactly where it was.
    expect(rock.row).toBe(ROW + 2);
  });
});

describe("the two opposite gestures", () => {
  it("re-tightens a ring off a body the mouth takes, so the wave feeds it", () => {
    const world = open();
    const b = tube(world);
    // Four rings slack, which is the phase that inhales every beat and stops
    // sliding: the plainest place to watch a heal, and the one the design
    // means by *it inhales continuously rather than on a clock*.
    b.slack = CFG.throatRings - 1;
    b.phase = "open";
    b.phaseBeat = world.beat;
    put(world, "slick", HOME, ROW);
    beats(world, 1);
    expect(b.slack).toBe(CFG.throatRings - 2);
    expect(b.fedBeat).toBe(world.beat);
    expect(world.creatures).toHaveLength(0);
  });

  it("swallows before it lifts, so a body hauled into the mouth gets a window", () => {
    const world = open();
    const b = tube(world);
    b.phaseBeat = world.beat;
    const rock = put(world, "meteor", HOME, ROW + 1);
    beats(world, CFG.throatInhaleBeats);
    // Lifted into the mouth on this inhale and **not** eaten on it: the swallow
    // ran first, and the next inhale is the one that takes it. Those beats are
    // player 2's window, and the design's step 7 is nothing but it, missed.
    expect(rock.row).toBe(ROW);
    expect(b.fedBeat).toBe(-1);
    beats(world, CFG.throatInhaleBeats);
    expect(b.fedBeat).toBe(world.beat);
    expect(world.creatures).toHaveLength(0);
  });

  it("chokes a ring off a gum a hand has flung into the mouth, and opens a slow", () => {
    const world = open();
    const b = tube(world);
    b.phaseBeat = world.beat;
    const gum = put(world, "gum", 0, ROW);
    // The whole gesture: a thumb carried it far enough, so it leaves its lane
    // and flies level along the row it was on (`gum.ts`).
    gumSwiped(world, gum, 1);
    let choked = false;
    for (let i = 0; i < 6 && !choked; i++) {
      beats(world, 1);
      choked = b.slack > 0;
    }
    expect(choked).toBe(true);
    expect(throatRingsLeft(CFG, b)).toBe(CFG.throatRings - 1);
    expect(world.creatures).toHaveLength(0);
    expect(slowing(world)).toBe(true);
  });

  it("is not hurt by a gum that falls, only by one that is thrown", () => {
    const world = open();
    const b = tube(world);
    b.phaseBeat = world.beat;
    put(world, "gum", HOME, ROW + 1);
    beats(world, 2 * CFG.throatInhaleBeats);
    // It reached the mouth and was eaten like anything else. A gum is a gift
    // until a hand makes it a weapon.
    expect(b.slack).toBe(0);
    expect(b.fedBeat).toBeGreaterThan(-1);
  });
});

describe("the phases, and how the fight is longer rather than undone", () => {
  it("reads the phase off the rings, and reaches the eversion at all of them", () => {
    expect(throatPhaseFor(CFG, 0)).toBe("still");
    expect(throatPhaseFor(CFG, 1)).toBe("slide");
    expect(throatPhaseFor(CFG, 2)).toBe("quick");
    expect(throatPhaseFor(CFG, CFG.throatRings - 1)).toBe("open");
    expect(throatPhaseFor(CFG, CFG.throatRings)).toBe("everts");
  });

  it("never goes back a phase when a ring re-tightens", () => {
    const world = open();
    const b = tube(world);
    b.slack = 3;
    beats(world, 1);
    expect(b.phase).toBe("quick");
    // Fed all the way back to a whole tube, and the mouth keeps the ground it
    // took: what a heal costs is rings, never the phase.
    b.slack = 0;
    beats(world, 1);
    expect(b.phase).toBe("quick");
  });

  it("carries the mouth on from the column it was standing in", () => {
    const world = open();
    const b = tube(world);
    beats(world, 3);
    b.slack = 1;
    beats(world, 1);
    expect(b.phase).toBe("slide");
    // The mouth was over the middle and the travel starts there, so a phase
    // change is never a jump.
    expect(b.mouthFrom).toBe(HOME);
    expect(throatMouthCol(CFG, b, b.phaseBeat)).toBe(HOME);
  });

  it("everts for throatEvertBeats, slowed, and then there is no boss", () => {
    const world = open();
    const b = tube(world);
    b.slack = CFG.throatRings;
    beats(world, 1);
    expect(b.phase).toBe("everts");
    expect(slowing(world)).toBe(true);
    beats(world, CFG.throatEvertBeats);
    expect(world.boss).toBeNull();
  });

  it("holds nothing while it is turning inside out", () => {
    const world = open();
    const b = tube(world);
    b.slack = CFG.throatRings;
    beats(world, 1);
    const rock = put(world, "meteor", HOME, ROW + 1);
    beats(world, 1);
    expect(rock.row).toBe(ROW + 2);
  });
});

describe("the fingerprint", () => {
  it("moves when the mouth's anchor does, because the anchor is the position", () => {
    const world = open();
    const b = tube(world);
    const before = hashWorld(world);
    b.mouthFrom += 1;
    expect(hashWorld(world)).not.toBe(before);
    b.mouthFrom -= 1;
    b.slack += 1;
    expect(hashWorld(world)).not.toBe(before);
  });
});
