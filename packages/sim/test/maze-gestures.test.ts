import { describe, expect, test } from "bun:test";
import { failHolds, hashWorld, step } from "../src/index.js";
import { mazeBottomCol } from "../src/maze.js";
import { mazeHeartColor } from "../src/maze-round.js";
import { mazeCoreEntrance } from "../src/maze-wheel.js";
import type { Command } from "../src/types.js";
import type { World } from "../src/world.js";
import {
  CFG,
  clickOnto,
  fireInto,
  install,
  mazeOf,
  past,
  send,
  TPB,
  tear,
  untilReading,
  WHEELS,
} from "./maze-fixture.js";

/**
 * THE MAZE's third state, played headlessly: the heart holding the shot, and
 * the two hands that tear it out (`maze-hand.ts`, `.claude/skills/new-boss`
 * §6.2). The right shot arriving is not the verdict; the navigator's pull on
 * the picture while the pilot braces the string is; either alone is not; and
 * a heart held past its patience gives the shot back as blood.
 */

const PULL = CFG.mazeHeartPullMilli;

/** The first wheel, right shot in the middle: `grip`. */
function held(): World {
  const world = install();
  untilReading(world);
  fireInto(world, mazeCoreEntrance(WHEELS[0]!));
  past(world, "travel", TPB * 200);
  expect(mazeOf(world).phase).toBe("grip");
  return world;
}

const heart = (on: boolean, fromYMilli: number): Command => ({
  kind: "drag",
  target: "mazeHeart",
  on,
  fromMilli: 0,
  fromYMilli,
});
const string = (on: boolean): Command => ({ kind: "drag", target: "mazeString", on, fromMilli: 0 });

describe("the heart holding the shot", () => {
  test("is entered on the right colour, and nothing is decided yet", () => {
    const world = held();
    const m = mazeOf(world);
    expect(m.hullMilli).toBe(100_000);
    expect(m.gripThumb).toBe(false);
    expect(m.gripPullMilli).toBe(0);
    expect(failHolds(world)).toBe(false);
  });

  test("gives the shot back as blood when nobody tears it out", () => {
    const world = held();
    const seen = past(world, "grip", TPB * (CFG.mazeGripBeats + 2));
    const verdict = seen.filter((e) => e.type === "mazeVerdict");
    expect(verdict).toHaveLength(1);
    expect(verdict[0]).toMatchObject({ right: false, reason: "slip" });
    const breach = seen.filter((e) => e.type === "breach");
    expect(breach).toHaveLength(1);
    expect(breach[0]).toMatchObject({ col: mazeBottomCol(CFG), color: mazeHeartColor(0) });
    expect(mazeOf(world).lost).toBe("slip");
    expect(mazeOf(world).hullMilli).toBe(100_000);
    expect(failHolds(world)).toBe(true);
  });
});

describe("the navigator's thumb", () => {
  test("lands with a report, stretches the heart, and springs back on the lift", () => {
    const world = held();
    let seen = send(world, 2, heart(true, 0));
    expect(seen).toContainEqual({ type: "mazeGrip", col: mazeBottomCol(CFG), on: true });
    expect(mazeOf(world).gripThumb).toBe(true);
    send(world, 2, heart(true, PULL / 2));
    expect(mazeOf(world).gripPullMilli).toBe(PULL / 2);
    // Clamped to the pull, and never upward.
    send(world, 2, heart(true, PULL * 3));
    expect(mazeOf(world).gripPullMilli).toBe(PULL);
    send(world, 2, heart(true, -400));
    expect(mazeOf(world).gripPullMilli).toBe(0);
    seen = send(world, 2, heart(false, PULL));
    expect(seen).toContainEqual({ type: "mazeGrip", col: mazeBottomCol(CFG), on: false });
    expect(mazeOf(world).gripThumb).toBe(false);
    expect(mazeOf(world).gripPullMilli).toBe(0);
    // A second lift says nothing twice.
    expect(send(world, 2, heart(false, 0)).filter((e) => e.type === "mazeGrip")).toHaveLength(0);
  });

  test("tears nothing without the pilot's hand on the string", () => {
    const world = held();
    send(world, 2, heart(true, 0));
    const seen = send(world, 2, heart(true, PULL));
    expect(seen.filter((e) => e.type === "mazeVerdict")).toHaveLength(0);
    expect(mazeOf(world).phase).toBe("grip");
    expect(mazeOf(world).gripPullMilli).toBe(PULL);
  });

  test("is the pilot's thumb never: his pull on the heart is dropped", () => {
    const world = held();
    send(world, 1, string(true));
    const seen = send(world, 1, heart(true, PULL));
    expect(seen.filter((e) => e.type === "mazeGrip")).toHaveLength(0);
    expect(mazeOf(world).gripThumb).toBe(false);
    expect(mazeOf(world).phase).toBe("grip");
  });

  test("is heard only while the heart is holding", () => {
    const world = install();
    untilReading(world);
    send(world, 2, heart(true, PULL));
    expect(mazeOf(world).gripThumb).toBe(false);
    expect(mazeOf(world).phase).toBe("read");
  });
});

describe("the tear", () => {
  test("is both hands at once: the wheel is finished and the boss takes a share", () => {
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
    expect(mazeOf(world).gripThumb).toBe(false);
    expect(mazeOf(world).gripPullMilli).toBe(0);
  });

  test("counts the brace whichever order the two hands land in", () => {
    const world = held();
    send(world, 2, heart(true, 0));
    send(world, 2, heart(true, PULL));
    expect(mazeOf(world).phase).toBe("grip");
    // The pull is already at its reach; the brace landing does not by itself
    // tear — the thumb has to be carried, so the next report of it does.
    send(world, 1, string(true));
    expect(mazeOf(world).phase).toBe("grip");
    send(world, 2, heart(true, PULL));
    expect(mazeOf(world).phase).toBe("verdict");
    expect(mazeOf(world).verdict).toBe(1);
  });

  test("is refused once the pilot lets go", () => {
    const world = held();
    send(world, 1, string(true));
    send(world, 1, string(false));
    send(world, 2, heart(true, 0));
    send(world, 2, heart(true, PULL));
    expect(mazeOf(world).phase).toBe("grip");
  });

  test("a hand kept on the string since the read is the brace already", () => {
    const world = install();
    untilReading(world);
    const col = clickOnto(world, mazeCoreEntrance(WHEELS[0]!));
    send(world, 1, { kind: "cannonCol", col });
    // The hand goes on before the shot and stays there through the walk;
    // under `grip` the brace turns nothing, and the string's pull is dropped
    // rather than read.
    send(world, 1, string(true));
    send(world, 2, { kind: "fire", color: mazeHeartColor(0) });
    past(world, "travel", TPB * 200);
    expect(mazeOf(world).phase).toBe("grip");
    expect(mazeOf(world).dragging).toBe(true);
    const angle = mazeOf(world).angleMilli;
    send(world, 1, { kind: "drag", target: "mazeString", on: true, fromMilli: 9_000 });
    expect(mazeOf(world).angleMilli).toBe(angle);
    send(world, 2, heart(true, 0));
    send(world, 2, heart(true, PULL));
    expect(mazeOf(world).phase).toBe("verdict");
  });
});

test("the thumb is in the hash", () => {
  const a = held();
  const b = held();
  expect(hashWorld(a)).toBe(hashWorld(b));
  send(a, 2, heart(true, 0));
  send(b, 2, heart(true, 0));
  expect(hashWorld(a)).toBe(hashWorld(b));
  send(a, 2, heart(true, 120));
  expect(hashWorld(a)).not.toBe(hashWorld(b));
  step(a, []);
  step(b, []);
  expect(hashWorld(a)).not.toBe(hashWorld(b));
});
