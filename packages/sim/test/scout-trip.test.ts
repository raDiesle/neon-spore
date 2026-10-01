import { describe, expect, it } from "bun:test";
import { failHolds, scoutCleared, scoutLeft, step } from "../src/index.js";
import {
  ARENA,
  burn,
  CFG,
  goHome,
  LAUNCH,
  open,
  play,
  press,
  round,
  swallowed,
  TPB,
} from "./scout-harness.js";

/**
 * THE SCOUT's trip: let go over the cannon, flown by the nose, a mote picked
 * up, and the mouth taking it home. The seats and what a mistake costs are
 * `scout.test.ts`'s.
 *
 * **The flying is checked as arithmetic rather than as feel.** Whether it is
 * fluent is the owner's to say and nothing here pretends otherwise; what a
 * test can hold is that a burn goes where the nose points, that letting go
 * brings the ship to rest, and that neither ever leaves the arena.
 */

describe("THE SCOUT's trip", () => {
  it("lets the ship go one tile above the cannon as the round opens", () => {
    // The owner, 29 September 2026: *the ship should go out immediately when
    // wave starts, just one tile above cannon*. No lead, no drift into place.
    const world = open();
    play(world);
    expect(world.tick).toBeLessThanOrEqual(1);
    expect(round(world).colMilli).toBe(LAUNCH.colMilli);
    expect(round(world).rowMilli).toBe(LAUNCH.rowMilli);
    expect(LAUNCH.rowMilli).toBe(CFG.rows * 1000 - 2_000);
  });

  it("flies where the nose points, and coasts after the thumb comes off", () => {
    const world = open();
    play(world);
    const from = round(world).rowMilli;
    burn(world, 20);
    // Numbers and not the round itself: the state is live, and a test holding
    // a reference to it compares a field with itself.
    const coasting = round(world).rowMilli;
    const speed = Math.abs(round(world).vRowMilli);
    // Up the arena is a falling row number, and the column has not moved: a
    // burn is along the nose and nowhere else.
    expect(coasting).toBeLessThan(from);
    expect(round(world).colMilli).toBe(LAUNCH.colMilli);
    for (let i = 0; i < 10; i++) step(world, []);
    // Still going with nothing held — that is the whole difference between a
    // ship and a cursor — and slowing down.
    expect(round(world).rowMilli).toBeLessThan(coasting);
    expect(Math.abs(round(world).vRowMilli)).toBeLessThan(speed);
  });

  it("comes to rest inside a couple of beats, which is what makes it easy", () => {
    const world = open();
    play(world);
    burn(world, 30);
    for (let i = 0; i < 2 * TPB; i++) step(world, []);
    expect(Math.abs(round(world).vRowMilli)).toBeLessThan(200);
  });

  it("steps the nose an eighth of a turn a press, and slowly while it is held", () => {
    // *It should snap each 45 degree and not so fast* — the cannon's feel.
    const world = open();
    play(world);
    press(world, 1, { kind: "scoutTurn", on: true, dir: 1 });
    expect(round(world).headingMilli).toBe(45_000);
    for (let i = 0; i < CFG.scoutTurnRepeatTicks - 2; i++) step(world, []);
    expect(round(world).headingMilli).toBe(45_000);
    for (let i = 0; i < 2; i++) step(world, []);
    expect(round(world).headingMilli).toBe(90_000);
    press(world, 1, { kind: "scoutTurn", on: false, dir: 1 }, 3 * CFG.scoutTurnRepeatTicks);
    expect(round(world).headingMilli).toBe(90_000);
    // And the other way, one press, one step.
    press(world, 1, { kind: "scoutTurn", on: true, dir: -1 });
    press(world, 1, { kind: "scoutTurn", on: false, dir: -1 });
    expect(round(world).headingMilli).toBe(45_000);
  });

  it("never leaves the arena, however long the burn is held", () => {
    const world = open();
    play(world);
    burn(world, 8 * TPB);
    const scout = round(world);
    expect(scout.rowMilli).toBeGreaterThanOrEqual(CFG.scoutRadiusMilli);
    expect(scout.colMilli).toBeGreaterThanOrEqual(CFG.scoutRadiusMilli);
    expect(scout.rowMilli).toBeLessThanOrEqual(CFG.rows * 1000);
    // And the wall is not a hazard: the wave is still being played.
    expect(failHolds(world)).toBe(false);
  });

  it("picks a mote up by flying over it and does not have it yet", () => {
    const world = open();
    play(world);
    burn(world, 3 * TPB);
    const scout = round(world);
    expect(scout.carrying).toEqual([0]);
    expect(scout.banked).toEqual([]);
    expect(scoutCleared(scout)).toBe(false);
    // Two motes authored, and neither is home: the count the seat reads is
    // what is still owed rather than what is still out there.
    expect(scoutLeft(scout)).toBe(2);
  });

  it("carries one mote at a time and flies straight through the next", () => {
    // Two in the ship's line; the second is passed over while the first is aboard.
    const world = open([
      {
        ...ARENA,
        motes: [
          { colMilli: 5_500, rowMilli: 10_000 },
          { colMilli: 5_500, rowMilli: 7_000 },
          { colMilli: 500, rowMilli: 500 },
        ],
      },
    ]);
    play(world);
    burn(world, 4 * TPB);
    expect(round(world).rowMilli).toBeLessThan(7_000);
    expect(round(world).carrying).toEqual([0]);
  });

  it("carries as many as its arena names, and still flies through the one past them", () => {
    // Three in the ship's line and a limit of two: the third is passed over.
    const world = open([
      {
        ...ARENA,
        carry: 2,
        motes: [
          { colMilli: 5_500, rowMilli: 10_000 },
          { colMilli: 5_500, rowMilli: 8_500 },
          { colMilli: 5_500, rowMilli: 7_000 },
          { colMilli: 500, rowMilli: 500 },
        ],
      },
    ]);
    play(world);
    burn(world, 4 * TPB);
    expect(round(world).rowMilli).toBeLessThan(7_000);
    expect(round(world).carrying).toEqual([0, 1]);
  });

  it("banks it only when the mouth sucks the ship in, from two tiles off", () => {
    const world = open();
    play(world);
    burn(world, 3 * TPB);
    expect(round(world).carrying.length).toBe(1);

    // Home is the bottom middle, so the way back is a half turn and a burn.
    expect(goHome(world)).toBe(true);
    // Inside the reach with the mouth shut: nothing is lost and nothing is taken.
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(round(world).banked).toEqual([]);
    expect(round(world).carrying).toEqual([0]);
    expect(round(world).sucking).toBe(false);

    // Her press takes the ship; the pilot's hands are dead while it runs home.
    press(world, 2, { kind: "scoutMaw" });
    expect(round(world).sucking).toBe(true);
    expect(swallowed(world)).toBe(true);
    expect(round(world).banked).toEqual([0]);
    expect(round(world).carrying).toEqual([]);
    // And the ship is let go again, where the round began.
    expect(round(world).colMilli).toBe(LAUNCH.colMilli);
    expect(round(world).rowMilli).toBe(LAUNCH.rowMilli);
  });
});
