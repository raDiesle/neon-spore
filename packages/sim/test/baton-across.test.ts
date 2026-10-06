import { describe, expect, it } from "bun:test";
import {
  BATON_LEVELS,
  BATON_SOCKET_DARK,
  batonBeadCol,
  batonBeadRowMilli,
  batonLandTick,
  batonLocked,
  batonSlotCol,
  batonSocketCol,
  batonSocketRow,
  MILLI,
  step,
  type World,
} from "../src/index.js";
import {
  arm,
  beats,
  CFG,
  cmd,
  cross,
  handover,
  landed,
  launch,
  lead,
  merging,
  open,
  QUIET,
  shoot,
  TPB,
  until,
} from "./baton-fixture.js";

/**
 * THE BATON's last level, `across` (`sim/baton-arm.ts`): the twin's fight on
 * an arm laid along a row, a socket a column, the bead passed left to right —
 * the owner, 6 October 2026, *one at the end that goes from left to right*.
 */

const ACROSS = BATON_LEVELS.indexOf("across");
const N = CFG.batonSockets;

/** Player 1 under the catch, maw open, until the pod is taken. */
function catchIt(world: World): void {
  for (let i = 0; i < 20 * TPB && arm(world).stage === "falling"; i++) {
    const col = Math.round((world.pods[0]?.colMilli ?? 0) / 1000);
    step(world, [cmd(world, 1, { kind: "cannonCol", col }), cmd(world, 1, { kind: "intake" })]);
  }
}

describe("THE BATON's arm across", () => {
  it("is the last level, after the two arms", () => {
    expect(ACROSS).toBe(BATON_LEVELS.length - 1);
    expect(BATON_LEVELS[ACROSS - 1]).toBe("pair");
  });

  it("lays its sockets along one row, a column each, left to right", () => {
    const b = arm(open(CFG, 3, ACROSS));
    expect(b.sockets).toHaveLength(N);
    for (let i = 0; i < N; i++) {
      expect(batonSocketRow(CFG, b, i)).toBe(CFG.batonAcrossRow);
      expect(batonSocketCol(CFG, b, i)).toBe(i);
      expect(batonSlotCol(CFG, b, i)).toBe(i);
    }
  });

  it("flies the bead a column to the right along the row, over the column it left for the first half", () => {
    const world = open(QUIET, 3, ACROSS);
    const bead = launch(world);
    expect([bead.fromCol, bead.col]).toEqual([0, 1]);
    const land = batonLandTick(CFG, bead);
    const early = bead.flightTick + 1;
    const late = land - 1;
    const b = arm(world);
    expect(batonBeadRowMilli(CFG, b, bead, early)).toBe(CFG.batonAcrossRow * MILLI);
    expect(batonBeadRowMilli(CFG, b, bead, late)).toBe(CFG.batonAcrossRow * MILLI);
    expect(batonBeadCol(CFG, b, bead, early)).toBe(0);
    expect(batonBeadCol(CFG, b, bead, late)).toBe(1);
    shoot(world, bead.color);
    expect(bead.struck).toBe(true);
    landed(world);
    expect(bead.socket).toBe(1);
    expect(arm(world).sockets[0]).toBe(BATON_SOCKET_DARK);
  });

  it("is met late only over the column the bead is landing in", () => {
    const world = open(QUIET, 3, ACROSS);
    const bead = launch(world);
    // Half a flight gone, with the cannon still under the column it left.
    while (world.tick < bead.flightTick + (batonLandTick(CFG, bead) - bead.flightTick) / 2)
      step(world, []);
    shoot(world, bead.color);
    expect(bead.struck).toBe(false);
    landed(world);
    // The pilot is locked from his launch through the beat after it; the
    // first tick he may move, he moves under where the bead is going.
    const again = launch(world);
    while (batonLocked(arm(world), 1, world.beat)) step(world, []);
    step(world, [cmd(world, 1, { kind: "cannonCol", col: again.col })]);
    shoot(world, again.color);
    expect(again.struck).toBe(true);
  });

  it("never swings: every flight lands one column on", () => {
    const world = open(QUIET, 3, ACROSS);
    until(world, "passing");
    for (let i = 0; i < N - 2 && arm(world).stage === "passing"; i++) {
      handover(world);
      until(world, "passing");
    }
    expect(lead(world).socket).toBeGreaterThan(CFG.batonSwingAfter);
    expect(batonSocketCol(CFG, arm(world), lead(world).socket)).toBe(lead(world).socket);
  });

  it("lights the second bead, merges, crosses, drops from under the last socket, and ends the boss", () => {
    const world = open(QUIET, 3, ACROSS);
    merging(world);
    expect(arm(world).beads).toHaveLength(2);
    cross(world);
    const b = arm(world);
    expect(b.stage).toBe("falling");
    expect(world.pods[0]?.colMilli).toBe((N - 1) * MILLI);
    // From under the last socket, and falling.
    expect(world.pods[0]?.rowMilli).toBeGreaterThanOrEqual((CFG.batonAcrossRow + 1) * MILLI);
    expect(world.pods[0]?.rowMilli).toBeLessThan((CFG.batonAcrossRow + 2) * MILLI);
    catchIt(world);
    expect(arm(world).stage).toBe("down");
    beats(world, CFG.batonDownBeats + 1);
    expect(world.boss).toBeNull();
  });
});
