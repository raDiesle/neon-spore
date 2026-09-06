import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  gripPushOf,
  hashWorld,
  NO_GRIP,
  type SimConfig,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "../src/index.js";

/**
 * THE PUSH: the grip carried sideways. A hand that has come a tile from where
 * it grabbed takes the body it is on one column that way, and then the body
 * stands still for a beat before it may be carried again.
 *
 * What these pin is the arithmetic nobody can see from a phone: that one tile
 * of finger is exactly one column and never two, that the pause is counted on
 * the body rather than on the hand, that a command lost on the wire heals
 * itself because a `drag` is cumulative, and that all of it is in the
 * fingerprint — a device that disagreed about which column a rock is stepping
 * into disagrees about whether the shield is in front of it.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** Deep enough that nothing reaches the hull mid-test: a carry is refused to a
 * body that has already arrived, and a removed one cannot be looked at. */
const TALL: SimConfig = { ...CFG, rows: 200 };

const grip = (tick: number, player: 1 | 2, id: number): TimedCommand => ({
  tick,
  player,
  command: { kind: "grip", id },
});

/** A hand that has come `tiles` from where it grabbed, in whole tiles — the
 * distance a device reports, which is cumulative and never an increment. */
const push = (tick: number, player: 1 | 2, id: number, tiles: number): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: "gripBody",
    on: true,
    fromMilli: Math.round(tiles * CFG.gripPushMilli),
    id,
  },
});

const lift = (tick: number, player: 1 | 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "gripBody", on: false, fromMilli: 0 },
});

function world(queue: SpawnEntry[], cfg: SimConfig = TALL) {
  return createWorld({ ...cfg }, 0, queue);
}

function play(w: ReturnType<typeof world>, beats: number, inputs: TimedCommand[] = []): void {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const until = w.tick + TPB * beats;
  while (w.tick < until) step(w, byTick.get(w.tick) ?? []);
}

const only = (w: ReturnType<typeof world>) => {
  const c = w.creatures[0];
  if (!c) throw new Error("the field is empty");
  return c;
};

const rock = (col = 5): SpawnEntry[] => [{ beat: 0, col, kind: "meteor", color: null }];

describe("a hand carried sideways", () => {
  it("takes the body one column the way it went", () => {
    const w = world(rock());
    play(w, 3, [grip(TPB, 1, 1), push(TPB, 1, 1, 1)]);
    expect(only(w).col).toBe(6);
  });

  it("goes the other way on a hand that went the other way", () => {
    const w = world(rock());
    play(w, 3, [grip(TPB, 2, 1), push(TPB, 2, 1, -1)]);
    expect(only(w).col).toBe(4);
  });

  it("is either seat's, the way the grip is", () => {
    for (const seat of [1, 2] as const) {
      const w = world(rock());
      play(w, 3, [grip(TPB, seat, 1), push(TPB, seat, 1, 1)]);
      expect(only(w).col).toBe(6);
    }
  });

  it("says nothing until the hand has come a whole tile", () => {
    const w = world(rock());
    play(w, 3, [grip(TPB, 1, 1), push(TPB, 1, 1, 0.9)]);
    expect(only(w).col).toBe(5);
  });

  it("does not move the body twice for one tile of finger", () => {
    const w = world(rock());
    // The same distance, said again and again — which is what a real thumb
    // held still sends. A `drag` is cumulative, so every one of these means
    // the hand is one tile out, not that it has moved another tile.
    const held = [1, 2, 3, 4, 5, 6].map((b) => push(TPB * b, 1, 1, 1));
    play(w, 8, [grip(TPB, 1, 1), ...held]);
    expect(only(w).col).toBe(6);
  });

  it("carries no faster than a column every other beat, however far the hand went", () => {
    const w = world(rock(1));
    // Three tiles at once: the pair earned three columns and gets them one at
    // a time, with a beat of quiet in between each.
    play(w, 2, [grip(TPB, 1, 1), push(TPB, 1, 1, 3)]);
    expect(only(w).col).toBe(2);
    play(w, 1);
    expect(only(w).col).toBe(2);
    play(w, 1);
    expect(only(w).col).toBe(3);
    play(w, 2);
    expect(only(w).col).toBe(4);
  });

  it("counts the pause on the body, so two hands are not twice as quick", () => {
    const one = world(rock(1));
    play(one, 6, [grip(TPB, 1, 1), push(TPB, 1, 1, 3)]);
    const both = world(rock(1));
    play(both, 6, [grip(TPB, 1, 1), push(TPB, 1, 1, 3), grip(TPB, 2, 1), push(TPB, 2, 1, 3)]);
    expect(both.creatures[0]?.col).toBe(one.creatures[0]?.col ?? -1);
  });

  it("holds still when the two hands pull against each other", () => {
    const w = world(rock());
    play(w, 6, [grip(TPB, 1, 1), push(TPB, 1, 1, 1), grip(TPB, 2, 1), push(TPB, 2, 1, -1)]);
    expect(only(w).col).toBe(5);
    // And neither hand spent the column it asked for, so whichever lets go
    // first sends the body the other way on the next beat.
    play(w, 2, [grip(TPB * 6, 2, NO_GRIP)]);
    expect(only(w).col).toBe(6);
  });

  it("keeps the body on the field", () => {
    const w = world(rock(0));
    play(w, 12, [grip(TPB, 1, 1), push(TPB, 1, 1, -4)]);
    expect(only(w).col).toBe(0);
  });

  it("still falls: a carry buys a lane, never a beat", () => {
    const free = world(rock());
    play(free, 4);
    const carried = world(rock());
    play(carried, 4, [grip(TPB, 1, 1), push(TPB, 1, 1, 1)]);
    // The hand slows it, because a hand on a body is still the grip — what it
    // must not do is stop the fall.
    expect(only(carried).row).toBeGreaterThan(0);
    expect(only(carried).row).toBeLessThan(only(free).row);
    expect(only(carried).col).toBe(6);
  });

  it("draws the step as a glide: fromCol is where it came from", () => {
    const w = world(rock());
    // Stopped on the beat the carry lands: the next one writes `fromCol`
    // again, which is what makes a body that is standing still stand still.
    play(w, 2, [grip(TPB, 1, 1), push(TPB, 1, 1, 1)]);
    expect(only(w).fromCol).toBe(5);
    expect(only(w).col).toBe(6);
  });
});

describe("the hand letting go", () => {
  it("forgets what it had carried, so a new grab starts from nought", () => {
    const w = world(rock());
    play(w, 3, [grip(TPB, 1, 1), push(TPB, 1, 1, 1)]);
    expect(only(w).col).toBe(6);
    play(w, 1, [lift(TPB * 3, 1)]);
    expect(gripPushOf(w, 1)).toBeNull();
    // The same distance again on a fresh grab: the finger is a tile out from
    // where it grabbed this time, so it earns a column this time.
    play(w, 4, [grip(TPB * 4, 1, 1), push(TPB * 4, 1, 1, 1)]);
    expect(only(w).col).toBe(7);
  });

  it("is dropped when the hand names a body it is not holding", () => {
    const w = world(rock());
    play(w, 3, [grip(TPB, 1, 1), push(TPB, 1, 1, 99)]);
    play(w, 1, [push(TPB * 3, 1, 404, 1)]);
    expect(gripPushOf(w, 1)).toBeNull();
  });

  it("goes when the grip does, so a hand moved to another body carries nothing", () => {
    const w = world([
      { beat: 0, col: 2, kind: "meteor", color: null },
      { beat: 0, col: 8, kind: "meteor", color: null },
    ]);
    play(w, 3, [grip(TPB, 1, 1), push(TPB, 1, 1, 1)]);
    play(w, 1, [grip(TPB * 3, 1, 2)]);
    expect(gripPushOf(w, 1)).toBeNull();
  });
});

describe("two devices", () => {
  it("puts the carry in the fingerprint", () => {
    const still = world(rock());
    play(still, 2, [grip(TPB, 1, 1)]);
    const carried = world(rock());
    play(carried, 2, [grip(TPB, 1, 1), push(TPB, 1, 1, 1)]);
    expect(hashWorld(carried)).not.toBe(hashWorld(still));
  });

  it("puts the beat a body was last carried on in it too", () => {
    // Two worlds that have both been carried one column and are standing in
    // the same place — one of them a beat ago, one of them now. Which of them
    // may be carried on the next beat is different, so the fingerprint has to
    // be too.
    const early = world(rock());
    play(early, 2, [grip(TPB, 1, 1), push(TPB, 1, 1, 1)]);
    play(early, 2);
    const late = world(rock());
    play(late, 3, [grip(TPB * 2, 1, 1), push(TPB * 2, 1, 1, 1)]);
    play(late, 1);
    expect(early.creatures[0]?.col).toBe(late.creatures[0]?.col ?? -1);
    expect(hashWorld(early)).not.toBe(hashWorld(late));
  });
});
