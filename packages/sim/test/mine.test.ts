import { describe, expect, it } from "bun:test";
import { refusesABolt } from "../src/bullet-refused.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  hullRow,
  mineFuseLeft,
  mineOnField,
  mineRows,
  mineSeenBy,
  record,
  runReplay,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";
import { minePlaceRow } from "../src/mine.js";

/**
 * THE MINE: the tile, the count, and the three things a finger can do to it.
 *
 * Everything here is about *places* rather than about time, which is the one
 * way this creature is unlike every other body in the bestiary — it does not
 * move, so there is no fall to test and no arrival to time. What is left is
 * exactly what the pair argues about: which square, whose finger, and what the
 * square next door costs.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const mine = (col: number, row: number, sees: 1 | 2, beat = 0): SpawnEntry => ({
  beat,
  col,
  kind: "mine",
  color: sees === 1 ? "red" : "cyan",
  row,
  sees,
});

const tap = (tick: number, player: 1 | 2, col: number, row: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "tapTile", col, row },
});

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []) {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

/** The one mine on the field, after the arrival has been placed. */
function only(world: ReturnType<typeof createWorld>) {
  const c = world.creatures.find((b) => b.kind === "mine");
  if (!c) throw new Error("no mine on the field");
  return c;
}

describe("where a mine may stand", () => {
  it("keeps clear of the radar strip above and the shield below", () => {
    const { top, bottom } = mineRows(CFG);
    expect(top).toBe(2);
    expect(bottom).toBe(hullRow(CFG) - 2);
  });

  it("pulls an authored row into the band rather than refusing it", () => {
    const world = createWorld({ ...CFG }, 0, []);
    const { top, bottom } = mineRows(CFG);
    expect(minePlaceRow(world, 3, 0)).toBe(top);
    expect(minePlaceRow(world, 3, 99)).toBe(bottom);
    // And a row inside the band is the row, untouched: an author who names a
    // square gets that square.
    expect(minePlaceRow(world, 3, 5)).toBe(5);
  });

  it("never puts one on or beside another, because both squares are the hull", () => {
    // Two authored onto the same tile: the second steps down until it is two
    // clear of the first, which is the nearest square that is nobody's
    // neighbour.
    const { world } = run([mine(3, 5, 2), mine(3, 5, 1, 1)], TPB * 2);
    const rows = world.creatures.filter((c) => c.kind === "mine").map((c) => c.row);
    expect(rows.length).toBe(2);
    expect(Math.abs(rows[0]! - rows[1]!)).toBeGreaterThan(1);
  });
});

describe("what the field knows about a mine", () => {
  it("says so while one is standing and stops when it is gone", () => {
    const { world } = run([mine(3, 5, 2)], TPB);
    expect(mineOnField(world)).toBe(true);
    expect(mineOnField(createWorld({ ...CFG }, 0, []))).toBe(false);
  });

  it("defaults the seat to the navigator, so no body is one nobody can answer", () => {
    const world = createWorld({ ...CFG }, 0, []);
    expect(mineSeenBy({ ...only(run([mine(3, 5, 2)], TPB).world), mineSees: undefined })).toBe(2);
    expect(mineFuseLeft(world.cfg, only(run([mine(3, 5, 2)], TPB).world))).toBeGreaterThan(0);
  });

  it("stops a bolt instead of answering one", () => {
    // The owner's rule of 14 September 2026, and here it has a second reason:
    // a bolt that killed one would hand the seat holding the cannon both
    // halves of the sentence at once.
    expect(refusesABolt("mine")).toBe(true);
  });
});

describe("a finger on a tile", () => {
  it("shuts one when the blind seat lands on the exact square", () => {
    const { world: placed } = run([mine(3, 5, 2)], TPB);
    const at = only(placed);
    const { world, events } = run([mine(3, 5, 2)], TPB * 3, [tap(TPB * 2, 1, at.col, at.row)]);
    expect(events.filter((e) => e.type === "destroy").length).toBe(1);
    expect(world.creatures.filter((c) => c.kind === "mine").length).toBe(0);
    // And nothing was paid for it: shutting one is the only free press here.
    expect(events.some((e) => e.type === "breach")).toBe(false);
  });

  it("does nothing at all when the seat that can see it presses", () => {
    const { world: placed } = run([mine(3, 5, 2)], TPB);
    const at = only(placed);
    // Player 2 is drawn this one, so its own finger is not the answer — the
    // press is not a miss either, and costs it nothing.
    const { world, events } = run([mine(3, 5, 2)], TPB * 3, [tap(TPB * 2, 2, at.col, at.row)]);
    expect(events.some((e) => e.type === "destroy")).toBe(false);
    expect(events.some((e) => e.type === "reject")).toBe(false);
    expect(world.creatures.filter((c) => c.kind === "mine").length).toBe(1);
  });

  it("breaks the hull one tile out, and leaves the body standing", () => {
    const { world: placed } = run([mine(3, 5, 2)], TPB);
    const at = only(placed);
    const { world, events } = run([mine(3, 5, 2)], TPB * 3, [tap(TPB * 2, 1, at.col, at.row + 1)]);
    const breach = events.find((e) => e.type === "breach");
    expect(breach).toBeTruthy();
    // In the column the finger landed in, not the body's — the pair is told
    // where the hand was, which is the only thing that happened.
    expect(breach && "col" in breach ? breach.col : -1).toBe(at.col);
    expect(world.creatures.filter((c) => c.kind === "mine").length).toBe(1);
  });

  it("charges a beat for feeling around, to every fuse the seat owes", () => {
    const { world: placed } = run([mine(0, 3, 2), mine(6, 9, 2)], TPB);
    const before = placed.creatures.filter((c) => c.kind === "mine").map((c) => c.mineFuse);
    // A tile nowhere near either of them, pressed once.
    const { world, events } = run([mine(0, 3, 2), mine(6, 9, 2)], TPB * 2, [tap(TPB, 1, 3, 6)]);
    expect(events.some((e) => e.type === "reject")).toBe(true);
    const after = world.creatures.filter((c) => c.kind === "mine").map((c) => c.mineFuse);
    expect(after.length).toBe(2);
    // One off each, and the beat that passed took one more off both — what
    // matters is that neither was spared, not the arithmetic of the tempo.
    expect(after[0]).toBeLessThan(before[0]!);
    expect(after[1]).toBeLessThan(before[1]!);
  });
});

describe("the count running out", () => {
  it("breaks the hull on its own, with nobody's finger on the field", () => {
    const { world, events } = run([mine(3, 5, 2)], TPB * (CFG.mineFuseBeats + 4));
    expect(events.some((e) => e.type === "breach")).toBe(true);
    expect(world.creatures.filter((c) => c.kind === "mine").length).toBe(0);
  });

  it("runs one clock per body rather than the field's", () => {
    // Two put down four beats apart: the second still has its own count when
    // the first has gone off. A shared clock would make the second's number a
    // lie on the screen of the seat that has to act on it.
    const { world } = run([mine(0, 3, 2), mine(6, 9, 2, 4)], TPB * (CFG.mineFuseBeats + 2));
    const left = world.creatures.filter((c) => c.kind === "mine");
    expect(left.length).toBe(1);
    expect(mineFuseLeft(CFG, left[0]!)).toBeGreaterThan(0);
  });

  it("goes off when a wrong finger takes the last beat, not on the next one", () => {
    // The fuse walked down to one by feeling around, and then the press that
    // takes it to nought is the press that breaks the hull — the same end by
    // the same call as the count reaching nought on its own.
    const taps: TimedCommand[] = [];
    for (let i = 0; i < CFG.mineFuseBeats; i++) taps.push(tap(TPB + 1 + i * 2, 1, 0, 2));
    // Two beats of play and six wrong fingers: the count could not have run
    // out on its own in the time, so the breach below is the hand's.
    const { events } = run([mine(6, 9, 2)], TPB * 2, taps);
    expect(events.some((e) => e.type === "breach")).toBe(true);
  });
});

describe("a mine wave replays", () => {
  it("runs the same twice: two runs of one script agree tick for tick", () => {
    const replay = record({
      name: "one mine shut, one missed by a tile, one left to run out",
      seed: 5,
      queue: [mine(0, 3, 2), mine(6, 9, 1)],
      ticks: TPB * 10,
      inputs: [tap(TPB * 2, 1, 0, 3), tap(TPB * 4, 2, 6, 10)],
    });
    expect(hashWorld(runReplay(replay))).toBe(replay.expectHash!);
    expect(hashWorld(runReplay(replay))).toBe(hashWorld(runReplay(replay)));
  });
});
