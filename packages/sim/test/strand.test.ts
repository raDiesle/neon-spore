import { describe, expect, it } from "bun:test";
import {
  beadIsActive,
  beadIsSpent,
  beadOrder,
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
  step,
  strandBeadCount,
  strandHead,
  strandLeft,
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

describe("the thread a wave authors", () => {
  it("is one entry and several bodies, in consecutive columns", () => {
    for (const beads of [STRAND_MIN, 3, STRAND_MAX]) {
      const world = onField(beads);
      const on = threadOf(world);
      expect(on).toHaveLength(beads);
      const cols = on.map((c) => c.col).sort((a, b) => a - b);
      expect(cols[cols.length - 1]! - cols[0]!).toBe(beads - 1);
      // One thread, so one name — and it is the first bead's own id.
      expect(new Set(on.map(beadStrand)).size).toBe(1);
    }
  });

  it("holds the authored length inside the two bounds and inside the field", () => {
    expect(strandBeadCount(CFG, undefined)).toBe(CFG.strandBeads);
    expect(strandBeadCount(CFG, 1)).toBe(STRAND_MIN);
    expect(strandBeadCount(CFG, 99)).toBe(STRAND_MAX);
    // A field narrower than the ceiling is what actually decides it.
    expect(strandBeadCount({ ...CFG, cols: 3 }, STRAND_MAX)).toBe(3);
  });

  it("alternates the two colours along the order, from the authored one", () => {
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

  it("lights exactly one bead, and it is the lowest live order", () => {
    const world = onField(4);
    const on = threadOf(world);
    expect(on.filter((c) => beadIsActive(world, c))).toHaveLength(1);
    expect(beadIsActive(world, on[0]!)).toBe(true);
  });
});

describe("what a shot does", () => {
  it("shrivels the next bead, leaves it hanging, and lights the one after", () => {
    const world = onField(3);
    const before = threadOf(world);
    expect(shootHead(world)).toBe(false);
    // Still three bodies: a raisin is the readout, so nothing leaves the field.
    expect(threadOf(world)).toHaveLength(3);
    expect(beadIsSpent(before[0]!)).toBe(true);
    expect(strandLeft(world, beadStrand(before[0]!))).toBe(2);
    expect(beadIsActive(world, before[1]!)).toBe(true);
    expect(world.score).toBe(CFG.scoreStrandBead);
    const bead = world.events.filter((e) => e.type === "strandBead");
    expect(bead).toHaveLength(1);
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
  it("swells the last raisin back when the wrong bead is hit", () => {
    const world = onField(3);
    const on = threadOf(world);
    shootHead(world);
    expect(strandLeft(world, beadStrand(on[0]!))).toBe(2);

    // Now the third along the order, which is live and is not the head.
    const wrong = on[2]!;
    expect(beadIsActive(world, wrong)).toBe(false);
    expect(beadStruck(world, bolt(wrong.col, wrong.color ?? "red"), wrong)).toBe(false);
    expect(beadIsSpent(on[0]!)).toBe(false);
    expect(strandLeft(world, beadStrand(on[0]!))).toBe(3);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.events.filter((e) => e.type === "strandSwell")).toHaveLength(1);
  });

  it("has nothing to give back on the first bead, so that guess is an ordinary miss", () => {
    const world = onField(3);
    const wrong = threadOf(world)[1]!;
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
    for (const bead of threadOf(world)) expect(bead.row).toBe(4);
    expect(new Set(threadOf(world).map((c) => c.col)).size).toBe(3);
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

  it("puts the order into it too, so a rolled end cannot go unnoticed", () => {
    const world = onField(3);
    const before = hashWorld(world);
    const on = threadOf(world);
    // The same field with the order read from the other end: nothing about
    // where the bodies are has changed, and the fingerprint must still move.
    for (const bead of on) bead.strandOrder = on.length - 1 - beadOrder(bead);
    expect(hashWorld(world)).not.toBe(before);
  });
});
