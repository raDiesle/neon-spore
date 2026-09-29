import { describe, expect, test } from "bun:test";
import { failHolds, hashWorld, step } from "../src/index.js";
import { mazeBottomCol } from "../src/maze.js";
import { mazeHeartColor } from "../src/maze-round.js";
import {
  mazeRoomMilli,
  mazeShakeFreeMilli,
  mazeShakeSeatMilli,
  mazeShakeThrough,
} from "../src/maze-shake.js";
import { mazeCoreEntrance } from "../src/maze-wheel.js";
import type { World } from "../src/world.js";
import {
  CFG,
  fireInto,
  install,
  mazeOf,
  past,
  send,
  shake,
  TPB,
  tear,
  untilReading,
  WHEELS,
} from "./maze-fixture.js";

/**
 * THE MAZE's third state, played headlessly: the heart holding the shot, and
 * the two thumbs that shake it loose (`maze-hand.ts`, `maze-shake.ts`,
 * `.claude/skills/new-boss` §6.2). The right shot arriving is not the
 * verdict; both seats carrying the heart back and forth inside its room is;
 * one seat alone is not; and a heart held past its patience gives the shot
 * back as blood.
 */

/** The first wheel, right shot in the middle: `grip`. */
function held(): World {
  const world = install();
  untilReading(world);
  fireInto(world, mazeCoreEntrance(WHEELS[0]!));
  past(world, "travel", TPB * 200);
  expect(mazeOf(world).phase).toBe("grip");
  return world;
}

describe("the heart holding the shot", () => {
  test("is entered on the right colour, and nothing is decided yet", () => {
    const world = held();
    const m = mazeOf(world);
    expect(m.hullMilli).toBe(100_000);
    expect(m.gripSeats).toBe(0);
    expect(m.gripShookMilli).toEqual([0, 0]);
    expect(failHolds(world)).toBe(false);
  });

  test("gives the shot back as blood when nobody shakes it loose", () => {
    const world = held();
    const seen = past(world, "grip", TPB * (CFG.mazeGripBeats + 2));
    const verdict = seen.filter((e) => e.type === "mazeVerdict");
    expect(verdict).toHaveLength(1);
    expect(verdict[0]).toMatchObject({ right: false, reason: "slip" });
    const breach = seen.filter((e) => e.type === "breach");
    expect(breach).toHaveLength(1);
    expect(breach[0]).toMatchObject({ col: mazeBottomCol(CFG), color: mazeHeartColor(0) });
    expect(mazeOf(world).lost).toBe("slip");
    expect(failHolds(world)).toBe(true);
  });
});

describe("a thumb on the heart", () => {
  test("lands with a report, carries the heart any way, and springs back on the last lift", () => {
    const world = held();
    let seen = send(world, 2, shake(300, -200));
    expect(seen).toContainEqual({ type: "mazeGrip", col: mazeBottomCol(CFG), on: true });
    // Where it grabbed is its zero: nothing moved yet.
    expect(mazeOf(world).gripXMilli).toBe(0);
    send(world, 2, shake(400, -300));
    expect(mazeOf(world).gripXMilli).toBe(100);
    expect(mazeOf(world).gripYMilli).toBe(-100);
    expect(mazeOf(world).gripShookMilli[1]).toBe(141);
    seen = send(world, 2, shake(0, 0, false));
    expect(seen).toContainEqual({ type: "mazeGrip", col: mazeBottomCol(CFG), on: false });
    expect(mazeOf(world).gripSeats).toBe(0);
    expect(mazeOf(world).gripXMilli).toBe(0);
    // What it shook stays shaken, and a second lift says nothing twice.
    expect(mazeOf(world).gripShookMilli[1]).toBe(141);
    expect(send(world, 2, shake(0, 0, false)).filter((e) => e.type === "mazeGrip")).toHaveLength(0);
  });

  test("stops at the wall of the room, and a push into it earns nothing", () => {
    const world = held();
    const free = mazeShakeFreeMilli(CFG, mazeOf(world));
    expect(free).toBeGreaterThan(0);
    send(world, 1, shake(0));
    send(world, 1, shake(0, 9_000));
    expect(mazeOf(world).gripYMilli).toBe(free);
    const shook = mazeOf(world).gripShookMilli[0];
    expect(shook).toBe(free);
    send(world, 1, shake(0, 15_000));
    expect(mazeOf(world).gripShookMilli[0]).toBe(shook);
    // Back the other way moves at once: the hand's zero is where it stopped.
    send(world, 1, shake(0, 14_900));
    expect(mazeOf(world).gripYMilli).toBe(free - 100);
    // A diagonal is held to the circle, not to a square round it.
    send(world, 1, shake(20_000, 20_000));
    const m = mazeOf(world);
    expect(m.gripXMilli * m.gripXMilli + m.gripYMilli * m.gripYMilli).toBeLessThanOrEqual(
      free * free,
    );
  });

  test("is heard only while the heart is holding", () => {
    const world = install();
    untilReading(world);
    send(world, 2, shake(0));
    send(world, 2, shake(900));
    expect(mazeOf(world).gripSeats).toBe(0);
    expect(mazeOf(world).phase).toBe("read");
  });
});

describe("the shake", () => {
  test("is both seats: the wheel is finished and the boss takes a share", () => {
    const world = held();
    const seen = tear(world);
    const verdict = seen.filter((e) => e.type === "mazeVerdict");
    expect(verdict).toHaveLength(1);
    expect(verdict[0]).toMatchObject({ right: true });
    expect(mazeOf(world).phase).toBe("verdict");
    expect(mazeOf(world).hullMilli).toBe(100_000 - Math.round(100_000 / WHEELS.length));
    expect(world.retries).toBe(0);
    // The next wheel comes up with nothing under a thumb.
    past(world, "verdict", TPB * 8);
    untilReading(world);
    expect(mazeOf(world).round).toBe(1);
    expect(mazeOf(world).gripSeats).toBe(0);
    expect(mazeOf(world).gripShookMilli).toEqual([0, 0]);
  });

  test("is eight widths of the room in all, half from each seat", () => {
    const world = held();
    const m = mazeOf(world);
    const need = mazeShakeSeatMilli(CFG, m);
    expect(2 * need).toBe(8 * 2 * mazeRoomMilli(CFG, m));
    tear(world);
    // Both halves reached, and the tear on the swing that reached the last.
    const free = mazeShakeFreeMilli(CFG, m);
    for (const shook of m.gripShookMilli) {
      expect(shook).toBeGreaterThanOrEqual(need);
      expect(shook).toBeLessThan(need + 2 * free + 1);
    }
    expect(m.verdict).toBe(1);
  });

  test("one seat alone never finishes it, however long it shakes", () => {
    const world = held();
    send(world, 2, shake(0));
    let from = 0;
    for (let i = 0; i < 200; i++) {
      from += mazeOf(world).gripXMilli > 0 ? -5000 : 5000;
      send(world, 2, shake(from));
    }
    const m = mazeOf(world);
    expect(m.phase).toBe("grip");
    expect(mazeShakeThrough(CFG, m)).toBe(500);
  });
});

test("the thumbs and the shake are in the hash", () => {
  const a = held();
  const b = held();
  expect(hashWorld(a)).toBe(hashWorld(b));
  send(a, 2, shake(0));
  send(b, 2, shake(0));
  expect(hashWorld(a)).toBe(hashWorld(b));
  send(a, 1, shake(0));
  expect(hashWorld(a)).not.toBe(hashWorld(b));
  send(b, 1, shake(0));
  expect(hashWorld(a)).toBe(hashWorld(b));
  send(a, 2, shake(120, 40));
  expect(hashWorld(a)).not.toBe(hashWorld(b));
  step(a, []);
  step(b, []);
  expect(hashWorld(a)).not.toBe(hashWorld(b));
});
