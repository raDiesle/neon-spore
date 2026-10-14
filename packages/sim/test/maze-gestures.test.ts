import { describe, expect, test } from "bun:test";
import { failHolds, hashWorld, step } from "../src/index.js";
import { mazeBottomCol } from "../src/maze.js";
import { mazeHeartColor } from "../src/maze-round.js";
import { mazeRubDone, mazeRubSeatTurns } from "../src/maze-rub.js";
import { mazeCoreEntrance } from "../src/maze-wheel.js";
import type { World } from "../src/world.js";
import {
  CFG,
  fireInto,
  install,
  mazeOf,
  past,
  rub,
  send,
  TPB,
  tear,
  untilReading,
  WHEELS,
} from "./maze-fixture.js";

/**
 * THE MAZE's third state, played headlessly: the heart holding the shot, and
 * the two thumbs that rub it loose (`maze-hand.ts`, `maze-rub.ts`,
 * `.claude/skills/new-boss` §6.2). The right shot arriving is not the
 * verdict; both seats rubbing it their half of the turns is; one seat alone
 * is not; and a heart held past its patience gives the shot back as blood.
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
    expect(m.gripTurns).toEqual([0, 0]);
    expect(failHolds(world)).toBe(false);
  });

  test("gives the shot back as blood when nobody rubs it loose", () => {
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
  test("lands with a report, counts each fresh turn, and keeps them over a lift", () => {
    const world = held();
    let seen = send(world, 2, rub(0));
    expect(seen).toContainEqual({ type: "mazeGrip", col: mazeBottomCol(CFG), on: true });
    expect(mazeOf(world).gripTurns[1]).toBe(0);
    send(world, 2, rub(1));
    send(world, 2, rub(3));
    expect(mazeOf(world).gripTurns[1]).toBe(3);
    // The same count again is no turn.
    send(world, 2, rub(3));
    expect(mazeOf(world).gripTurns[1]).toBe(3);
    seen = send(world, 2, rub(3, false));
    expect(seen).toContainEqual({ type: "mazeGrip", col: mazeBottomCol(CFG), on: false });
    expect(mazeOf(world).gripSeats).toBe(0);
    // What it rubbed stays rubbed, and a second lift says nothing twice.
    expect(mazeOf(world).gripTurns[1]).toBe(3);
    expect(send(world, 2, rub(0, false)).filter((e) => e.type === "mazeGrip")).toHaveLength(0);
    // The next thumb down counts from nought again, onto what was rubbed.
    send(world, 2, rub(0));
    send(world, 2, rub(2));
    expect(mazeOf(world).gripTurns[1]).toBe(5);
  });

  test("counts a seat no further than its half", () => {
    const world = held();
    send(world, 1, rub(0));
    send(world, 1, rub(50));
    expect(mazeOf(world).gripTurns[0]).toBe(mazeRubSeatTurns(CFG));
  });

  test("is heard only while the heart is holding", () => {
    const world = install();
    untilReading(world);
    send(world, 2, rub(0));
    send(world, 2, rub(4));
    expect(mazeOf(world).gripSeats).toBe(0);
    expect(mazeOf(world).phase).toBe("read");
  });
});

describe("the rub", () => {
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
    expect(mazeOf(world).gripTurns).toEqual([0, 0]);
  });

  test("is sixteen turns in all, half from each seat, torn on the last", () => {
    const world = held();
    const m = mazeOf(world);
    expect(2 * mazeRubSeatTurns(CFG)).toBe(16);
    tear(world);
    expect(m.gripTurns).toEqual([8, 8]);
    expect(m.verdict).toBe(1);
  });

  test("one seat alone never finishes it, however long it rubs", () => {
    const world = held();
    send(world, 2, rub(0));
    for (let i = 1; i <= 200; i++) send(world, 2, rub(i));
    const m = mazeOf(world);
    expect(m.phase).toBe("grip");
    expect(mazeRubDone(CFG, m)).toBe(mazeRubSeatTurns(CFG));
  });
});

test("the thumbs and the rub are in the hash", () => {
  const a = held();
  const b = held();
  expect(hashWorld(a)).toBe(hashWorld(b));
  send(a, 2, rub(0));
  send(b, 2, rub(0));
  expect(hashWorld(a)).toBe(hashWorld(b));
  send(a, 1, rub(0));
  expect(hashWorld(a)).not.toBe(hashWorld(b));
  send(b, 1, rub(0));
  expect(hashWorld(a)).toBe(hashWorld(b));
  send(a, 2, rub(2));
  expect(hashWorld(a)).not.toBe(hashWorld(b));
  step(a, []);
  step(b, []);
  expect(hashWorld(a)).not.toBe(hashWorld(b));
});
