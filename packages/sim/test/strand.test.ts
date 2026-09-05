import { describe, expect, it } from "bun:test";
import {
  beadIsActive,
  beadIsLit,
  beadIsSpent,
  beadOrder,
  beadRowOffset,
  beadStrand,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullPercent,
  hullRow,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  STRAND_MAX,
  STRAND_MIN,
  STRAND_STEP,
  step,
  strandBeadCount,
  strandHead,
  strandLeft,
  strandLive,
  strandSpan,
  type TimedCommand,
  ticksPerBeat,
  wornKind,
} from "../src/index.js";
import { beadStruck } from "../src/strand-round.js";
import type { Bullet, Color, Creature } from "../src/types.js";

/**
 * THE STRAND: beads on one thread, shot in order, and the first arrival
 * neither seat can answer with what is on their own screen.
 *
 * What is worth pinning here is the half a reader of `strand.ts` cannot check
 * by eye — that a thread really is one queue entry and several bodies, that
 * exactly one of them is answerable at a time and it is the next one along
 * the order, that a shot at any other live bead **undoes** the last kill, that
 * a shrivelled bead stays on the field until the whole thread goes and costs
 * the hull nothing when it lands, and that a second device walking the same
 * beats arrives at the same fingerprint.
 *
 * The order runs from an end rolled on the beat the thread arrives, so no test
 * here may assume which end. Every one of them asks `strandHead` instead —
 * which is exactly what player 2's screen asks, and what the shot asks.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HULL = hullRow(CFG);
// A creature entered at beat 0 stands on row (beat - 1) — see rules.test.ts —
// and is through the hull one beat after it lands on it.
const BREACH_TICK = TPB * (HULL + 2);
const COL = 3;

const strand = (beads: number, color: Color = "red", col = COL): SpawnEntry => ({
  beat: 0,
  col,
  kind: "strand",
  color,
  beads,
});

/** A world with one thread on it, stepped far enough for the beads to stand. */
function onField(beads: number, color: Color = "red", ticks = TPB + 1) {
  const world = createWorld({ ...CFG }, 0, [strand(beads, color)]);
  for (let t = 0; t < ticks; t++) step(world, []);
  return world;
}

const threadOf = (world: ReturnType<typeof createWorld>): Creature[] =>
  world.creatures.filter((c) => c.kind === "strand").sort((a, b) => beadOrder(a) - beadOrder(b));

const bolt = (col: number, color: Color, lance = false): Bullet => ({
  id: 1,
  col,
  row: 0,
  subMilli: 0,
  color,
  lance,
  pierced: 0,
  driftMilli: 0,
  aimMilli: 0,
});

/** Shoot the bead the thread says is next, in its own colour. */
function shootHead(world: ReturnType<typeof createWorld>): boolean {
  const head = strandHead(world, beadStrand(threadOf(world)[0]!));
  expect(head).not.toBeNull();
  return beadStruck(world, bolt(head!.col, head!.color ?? "red"), head!);
}

/** A live bead of this thread that is not the lit one, or null when only one
 * is left. The tests never name an end: which is lit is rolled. */
function notLit(world: ReturnType<typeof createWorld>): Creature | null {
  const id = beadStrand(threadOf(world)[0]!);
  return strandLive(world, id).find((c) => !beadIsActive(world, c)) ?? null;
}

describe("the thread a wave authors", () => {
  it("is one entry and several bodies, a lane apart and hung in a zigzag", () => {
    for (const beads of [STRAND_MIN, 3, STRAND_MAX]) {
      const world = onField(beads);
      const on = threadOf(world);
      expect(on).toHaveLength(beads);
      // Spread `STRAND_STEP` columns apart, so there is a lane of empty field
      // between every pair for the thread to be seen along.
      expect(on.map((c) => c.col)).toEqual(on.map((_, i) => on[0]!.col + i * STRAND_STEP));
      // And every other one hangs a row lower — a real row, not a drawn one.
      expect(on.map((c) => c.row - on[0]!.row)).toEqual(on.map((_, i) => beadRowOffset(i)));
      // One thread, so one name — and it is the first bead's own id.
      expect(new Set(on.map(beadStrand)).size).toBe(1);
    }
  });

  it("holds the authored length inside the two bounds and inside the field", () => {
    expect(strandBeadCount(CFG, undefined)).toBe(CFG.strandBeads);
    expect(strandBeadCount(CFG, 1)).toBe(STRAND_MIN);
    expect(strandBeadCount(CFG, 99)).toBe(STRAND_MAX);
    // A field narrower than the ceiling is what actually decides it, and it is
    // the *spread* run that has to fit rather than the bead count.
    expect(strandBeadCount({ ...CFG, cols: 3 }, STRAND_MAX)).toBe(2);
    expect(strandSpan(strandBeadCount(CFG, STRAND_MAX))).toBeLessThanOrEqual(CFG.cols);
  });

  it("alternates the two colours along the thread, from the authored one", () => {
    for (const color of ["red", "cyan"] as const) {
      const on = threadOf(onField(STRAND_MAX, color));
      expect(on[0]!.color).toBe(color);
      for (let i = 1; i < on.length; i++) {
        expect(on[i]!.color).not.toBe(on[i - 1]!.color);
      }
      // And each bead is drawn as the body its own colour names, which is what
      // player 1 reads off the field and says out loud.
      for (const bead of on) {
        expect(wornKind(bead)).toBe(bead.color === "red" ? "slick" : "bulb");
      }
    }
  });

  it("shifts a thread that would hang off the edge back onto the field", () => {
    const world = createWorld({ ...CFG }, 0, [strand(STRAND_MAX, "red", CFG.cols - 1)]);
    for (let t = 0; t < TPB + 1; t++) step(world, []);
    const cols = threadOf(world).map((c) => c.col);
    expect(Math.min(...cols)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...cols)).toBeLessThanOrEqual(CFG.cols - 1);
  });

  /** Which end is lit is rolled, so the test may only say *an* end. */
  it("lights exactly one bead, and it is an end of the thread", () => {
    const world = onField(4);
    const on = threadOf(world);
    const lit = on.filter((c) => beadIsActive(world, c));
    expect(lit).toHaveLength(1);
    expect([on[0]!.id, on[on.length - 1]!.id]).toContain(lit[0]!.id);
  });
});

describe("what a shot does", () => {
  it("shrivels the lit bead, leaves it hanging, and lights an end of the rest", () => {
    const world = onField(3);
    const id = beadStrand(threadOf(world)[0]!);
    const was = strandHead(world, id)!;
    expect(shootHead(world)).toBe(false);
    // Still three bodies: a raisin is the readout, so nothing leaves the field.
    expect(threadOf(world)).toHaveLength(3);
    expect(beadIsSpent(was)).toBe(true);
    expect(strandLeft(world, id)).toBe(2);
    // And exactly one of the two still alive is lit — an end of the run, which
    // is both of them when two are left.
    const live = strandLive(world, id);
    expect(live.filter((c) => beadIsActive(world, c))).toHaveLength(1);
    expect(world.score).toBe(CFG.scoreStrandBead);
    expect(world.events.filter((e) => e.type === "strandBead")).toHaveLength(1);
  });

  /**
   * The change the owner asked for, and the whole reason the lit end is stored
   * rather than derived: over many threads the end that comes up second is
   * sometimes the far one, so neither seat can read the next bead off the
   * raisin the last shot left. A fixed march would answer "always the same
   * side" here, every time.
   */
  it("rolls which end is lit again after every kill, rather than marching", () => {
    // Seeds whose thread opens lit at the **left** end, so every run in the
    // sample starts from the same place. A fixed march would then always light
    // the bead next to the raisin — place 1 — and this set would have one
    // member. It has two, which is the whole of the change: the far end comes
    // up as often as the near one, so a raisin says nothing about what is next.
    const second = new Set<number>();
    for (let seed = 0; seed < 40; seed++) {
      const world = createWorld({ ...CFG }, seed, [strand(4)]);
      for (let t = 0; t < TPB + 1; t++) step(world, []);
      const id = beadStrand(threadOf(world)[0]!);
      if (beadOrder(strandHead(world, id)!) !== 0) continue;
      shootHead(world);
      second.add(beadOrder(strandHead(world, id)!));
    }
    expect([...second].sort()).toEqual([1, 3]);
  });

  it("refuses the wrong colour on the right bead, as an ordinary colour miss", () => {
    const world = onField(3);
    const head = threadOf(world)[0]!;
    const wrong: Color = head.color === "red" ? "cyan" : "red";
    expect(beadStruck(world, bolt(head.col, wrong), head)).toBe(false);
    expect(beadIsSpent(head)).toBe(false);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.score).toBe(0);
  });

  /** The creature, as a number: a landed shot at the wrong bead moves the pair
   * backwards rather than nowhere. */
  it("swells a raisin back when the wrong bead is hit", () => {
    const world = onField(4);
    const id = beadStrand(threadOf(world)[0]!);
    shootHead(world);
    expect(strandLeft(world, id)).toBe(3);

    const wrong = notLit(world)!;
    expect(beadIsActive(world, wrong)).toBe(false);
    expect(beadStruck(world, bolt(wrong.col, wrong.color ?? "red"), wrong)).toBe(false);
    expect(strandLeft(world, id)).toBe(4);
    expect(threadOf(world).filter(beadIsSpent)).toHaveLength(0);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.events.filter((e) => e.type === "strandSwell")).toHaveLength(1);
    // And the thread is lit again, at an end of what is now a whole run.
    expect(threadOf(world).filter((c) => beadIsActive(world, c))).toHaveLength(1);
  });

  it("has nothing to give back on the first bead, so that guess is an ordinary miss", () => {
    const world = onField(3);
    const wrong = notLit(world)!;
    expect(beadStruck(world, bolt(wrong.col, wrong.color ?? "red"), wrong)).toBe(false);
    expect(threadOf(world).filter(beadIsSpent)).toHaveLength(0);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.events.filter((e) => e.type === "strandSwell")).toHaveLength(0);
  });

  it("spends a shot on a raisin and does nothing else with it", () => {
    const world = onField(3);
    const raisin = threadOf(world)[0]!;
    shootHead(world);
    const score = world.score;
    const misses = world.balance.colorMisses;
    expect(beadStruck(world, bolt(raisin.col, raisin.color ?? "red"), raisin)).toBe(false);
    expect(world.score).toBe(score);
    expect(world.balance.colorMisses).toBe(misses);
    expect(strandLeft(world, beadStrand(raisin))).toBe(2);
  });

  /** A lance is a line up a column, and a thread is several bodies in several
   * columns — but the one it does meet must not become two. */
  it("never passes a lance on, however the bead answered", () => {
    const world = onField(3);
    const head = strandHead(world, beadStrand(threadOf(world)[0]!))!;
    expect(beadStruck(world, bolt(head.col, head.color ?? "red", true), head)).toBe(false);
  });
});

describe("the end of a thread", () => {
  it("takes the whole of it off a beat after the last bead, and pays for it", () => {
    // A slick standing in the far column, so the wave does not clear on the
    // same beat the thread parts — what is being counted here is what the
    // strand paid, and a cleared wave pays for itself on top of it.
    const keepOpen: SpawnEntry = { beat: 0, col: 0, kind: "slick", color: "red" };
    const world = createWorld({ ...CFG }, 0, [strand(2, "red", CFG.cols - 2), keepOpen]);
    for (let t = 0; t < TPB + 1; t++) step(world, []);
    shootHead(world);
    shootHead(world);
    // Still hanging on the beat the last one was shrivelled: the pair is owed
    // the sight of the thread coming apart (`breakSpentStrands`).
    expect(threadOf(world)).toHaveLength(2);
    for (let t = 0; t < TPB; t++) step(world, []);
    expect(threadOf(world)).toHaveLength(0);
    expect(world.creatures).toHaveLength(1);
    expect(world.score).toBe(CFG.scoreStrandBead * 2 + CFG.scoreStrandBreak);
  });

  it("says so when it parts, and does not hold the wave open afterwards", () => {
    const world = onField(2);
    shootHead(world);
    shootHead(world);
    const broke: SimEvent[] = [];
    for (let t = 0; t < TPB * 3; t++) {
      step(world, []);
      broke.push(...world.events.filter((e) => e.type === "strandBroke"));
    }
    expect(broke).toHaveLength(1);
    expect(world.creatures).toHaveLength(0);
  });
});

describe("the thread as an arrival", () => {
  it("costs the hull once per live bead that lands", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [strand(2)]);
    for (let t = 0; t < BREACH_TICK + 1; t++) step(world, []);
    expect(hullPercent(world)).toBe(100 - CFG.damageCreature * 2);
  });

  it("charges nothing for a raisin, which has already been paid for", () => {
    const noRegen: SimConfig = { ...CFG, hullRegenPerSecond: 0 };
    const world = createWorld(noRegen, 0, [strand(2)]);
    for (let t = 0; t < TPB + 1; t++) step(world, []);
    shootHead(world);
    for (let t = 0; t < BREACH_TICK + 1; t++) step(world, []);
    expect(hullPercent(world)).toBe(100 - CFG.damageCreature);
  });

  it("falls a tile a beat, every bead of it, and holds its lane", () => {
    const world = onField(3, "red", TPB * 5);
    const on = threadOf(world);
    // Four rows down from where each one entered, which is not the same row
    // for all of them: the zigzag is carried the whole way down.
    for (const [i, bead] of on.entries()) expect(bead.row).toBe(4 + beadRowOffset(i));
    expect(new Set(on.map((c) => c.col)).size).toBe(3);
  });
});

describe("two devices", () => {
  it("replays deterministically, rolled end and all", () => {
    const replay = record({
      name: "a thread of four falls untouched",
      seed: 0,
      queue: [strand(4, "cyan")],
      ticks: TPB * 6,
      inputs: [] as TimedCommand[],
    });
    const world = runReplay(replay);
    expect(world.creatures).toHaveLength(4);
    // Not a pinned constant — two runs of one replay in one process is the
    // property lockstep actually needs (docs/decisions.md #19).
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
  });

  it("puts a shrivelled bead into the fingerprint, so two devices cannot differ", () => {
    const whole = onField(3);
    const shot = onField(3);
    shootHead(shot);
    expect(hashWorld(shot)).not.toBe(hashWorld(whole));
  });

  it("puts the lit end into it too, so a rolled end cannot go unnoticed", () => {
    const world = onField(3);
    const before = hashWorld(world);
    const on = threadOf(world);
    // The same field with the other end lit: nothing about where the bodies
    // are has changed, and the fingerprint must still move.
    for (const bead of on) bead.strandLit = !beadIsLit(bead);
    expect(hashWorld(world)).not.toBe(before);
  });
});
