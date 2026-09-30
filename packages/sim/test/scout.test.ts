import { describe, expect, it } from "bun:test";
import { failHolds, hashWorld, step } from "../src/index.js";
import { ARENA, burn, LAUNCH, NEXT, open, play, press, round, TPB } from "./scout-harness.js";

/**
 * THE SCOUT, and the sentence it is built to make true: **one of you flies it
 * and the other one can see where it is going**.
 *
 * Player 1 has the two turns and the burn and is shown the ship; player 2 has
 * the mother ship's mouth and is shown the arena. Everything checked here is
 * either that split or what it costs to get it wrong — a hazard's touch and
 * the clock, which are one rule wearing two coats, and the rule is the
 * field's: a hit is the wave lost (`wave-fail.ts`). The flying itself is
 * `scout-trip.test.ts`'s.
 */

describe("THE SCOUT", () => {
  it("gives the pilot no mouth and the other seat no ship", () => {
    const world = open();
    play(world);
    // Player 2 cannot fly it.
    press(world, 2, { kind: "scoutBurn", on: true }, 20);
    expect(round(world).rowMilli).toBe(LAUNCH.rowMilli);
    expect(round(world).burning).toBe(false);
    // And player 1 cannot open the mouth.
    press(world, 1, { kind: "scoutMaw" });
    expect(round(world).mawTick).toBe(-1);
  });

  it("costs the hull when a hazard catches it, and that is the wave lost", () => {
    // One hazard, sitting exactly where the ship is let go.
    const world = open([{ ...ARENA, hazards: [{ ...LAUNCH, vColMilli: 0, vRowMilli: 0 }] }]);
    play(world);
    step(world, []);
    expect(round(world).caughtTick).toBeGreaterThanOrEqual(0);
    expect(round(world).caughtBy).toBe(0);
    // A breach rather than a number: the hull's own bookkeeping is
    // `hull-damage.ts`'s, and what this round owes is the event and the loss.
    expect(world.events.some((e) => e.type === "breach")).toBe(true);
    expect(failHolds(world)).toBe(true);
  });

  it("costs the hull when the clock runs out with a mote still owed", () => {
    const world = open([{ ...ARENA, beats: 2 }]);
    play(world);
    let breached = false;
    for (let i = 0; i < 4 * TPB && !breached; i++) {
      step(world, []);
      // Asked on the tick rather than at the end: the events are this tick's
      // and the next tick is a fresh list.
      breached = world.events.some((e) => e.type === "breach");
    }
    expect(breached).toBe(true);
    expect(round(world).passed).toBe(false);
    expect(failHolds(world)).toBe(true);
  });

  it("opens the next arena when every mote is home", () => {
    // One mote, right where the ship is let go — which is inside the reach.
    const world = open([{ ...ARENA, motes: [{ ...LAUNCH }], hazards: [] }, NEXT]);
    play(world);
    step(world, []);
    expect(round(world).carrying).toEqual([0]);
    press(world, 2, { kind: "scoutMaw" });
    for (let i = 0; i < 4 * TPB && round(world).arena === 0; i++) step(world, []);
    expect(round(world).arena).toBe(1);
    expect(round(world).colMilli).toBe(LAUNCH.colMilli);
    expect(round(world).rowMilli).toBe(LAUNCH.rowMilli);
    expect(round(world).banked).toEqual([]);
  });

  it("flies the same ship on two devices", () => {
    // The point of every integer in the round: the same presses on the same
    // ticks are the same world, to the fingerprint (`docs/decisions.md` #23).
    const a = open();
    const b = open();
    for (const world of [a, b]) {
      play(world);
      press(world, 1, { kind: "scoutTurn", on: true, dir: -1 }, 7);
      press(world, 1, { kind: "scoutTurn", on: false, dir: -1 });
      burn(world, 40);
      press(world, 2, { kind: "scoutMaw" }, 30);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
