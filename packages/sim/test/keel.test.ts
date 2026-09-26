import { describe, expect, it } from "bun:test";
import { geometrySeat } from "../src/geometry-seat.js";
import { keelLit, keelLoose, keelSeat } from "../src/keel.js";
import { keelStruck } from "../src/keel-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  CFG,
  COLS,
  install,
  isLit,
  keel,
  MID,
  runUntil,
  shot,
  tap,
  tick,
  toSocket,
} from "./keel-rig.js";

/**
 * THE KEEL: a spine of joints, and whose tap a joint wants is read off which
 * half of the screen it sits on.
 *
 * What these pin is the rule a phone cannot show. That the other seat's tap on
 * a lit joint does nothing. That a missed joint before the fast run costs
 * nothing but the beat and lights again where it was. That the socket takes
 * only its own colour, and unanswered is a hit on the hull. That the fast run
 * goes in the wave's own order with no SLOW, and a miss there works a segment
 * loose. That the tail's rock takes either colour, and the fight ends.
 */

describe("geometrySeat", () => {
  it("gives the left half to P1, the right to P2 and the middle column to either", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => geometrySeat(c, 11))).toEqual([
      1,
      1,
      1,
      1,
      1,
      null,
      2,
      2,
      2,
      2,
      2,
    ]);
    expect([0, 4, 5, 9].map((c) => geometrySeat(c, 10))).toEqual([1, 1, 2, 2]);
  });
});

describe("THE KEEL comes in", () => {
  it("still, every segment loose, and nothing lit", () => {
    const world = install();
    const s = keel(world);
    expect(s.phase).toBe("still");
    expect(s.movement).toBe(1);
    expect(keelLoose(s)).toBe(CFG.keelSegments);
    expect(keelLit(s)).toBe(false);
    expect(world.events.some((e) => e.type === "keelEnter")).toBe(true);
  });

  it("keeps only the reprise indices that name a segment", () => {
    const world = install("cyan", [4, 9, -1, 0]);
    expect(keel(world).reprise).toEqual([4, 0]);
  });
});

describe("movement one", () => {
  it("lights the ends inward, left first, under THE SLOW", () => {
    const world = install();
    const order: number[] = [];
    for (let i = 0; i < 4; i++) {
      runUntil(world, isLit);
      expect(slowing(world)).toBe(true);
      order.push(keel(world).joint);
      answer(world);
      expect(slowing(world)).toBe(false);
    }
    expect(order).toEqual([0, 5, 1, 4]);
  });

  it("refuses the other seat's tap on a lit joint", () => {
    const world = install();
    runUntil(world, isLit);
    const s = keel(world);
    expect(keelSeat(s, COLS)).toBe(1);
    tick(world, [tap(world.tick, 2)]);
    expect(keel(world).locked[0]).toBe(false);
    expect(keelLit(keel(world))).toBe(true);
    expect(answer(world).has("keelLock")).toBe(true);
    expect(keel(world).locked[0]).toBe(true);
  });

  it("re-lights a missed joint where it was, and costs the hull nothing", () => {
    const world = install();
    runUntil(world, isLit);
    const seen = runUntil(world, (w) => !keelLit(keel(w)), CFG.keelJointBeats + 2);
    expect(seen.has("keelMiss")).toBe(true);
    runUntil(world, isLit);
    expect(keel(world).joint).toBe(0);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("opens the middle at two loose, and the socket flashes", () => {
    const world = install();
    toSocket(world);
    expect(keel(world).movement).toBe(2);
    expect(keelLoose(keel(world))).toBe(2);
    expect(slowing(world)).toBe(true);
  });
});

describe("the socket", () => {
  it("takes only its own colour, and then locks a joint for nothing", () => {
    const world = install("red");
    toSocket(world);
    keelStruck(world, shot(MID, "cyan"));
    expect(keel(world).phase).toBe("socket");
    keelStruck(world, shot(MID - 1, "red"));
    expect(keel(world).phase).toBe("socket");
    keelStruck(world, shot(MID, "red"));
    expect(keel(world).phase).toBe("rest");
    expect(keelLoose(keel(world))).toBe(1);
    expect(slowing(world)).toBe(false);
  });

  it("left unanswered is a hit on the hull", () => {
    const world = install();
    toSocket(world);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, CFG.keelSocketBeats + 2);
    expect(seen.has("keelSocketHit")).toBe(true);
  });
});
