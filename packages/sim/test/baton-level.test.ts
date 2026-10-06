import { describe, expect, it } from "bun:test";
import {
  BATON_LEVELS,
  BATON_SOCKET_LIT,
  batonLevel,
  batonLocked,
  step,
  type World,
} from "../src/index.js";
import {
  arm,
  beats,
  CFG,
  cmd,
  flying,
  handover,
  landed,
  lead,
  open,
  QUIET,
  shoot,
  TPB,
  TWIN,
  until,
} from "./baton-fixture.js";

/**
 * THE BATON's levels (`sim/baton-level.ts`): the arm passed down once with one
 * bead, folded, and unfolded again as the fight it shipped as — and either
 * seat's thumb sending the bead, with the lock on whoever pressed. The owner,
 * 6 October 2026: *each level brings in only one new thing.*
 */

const LAST = CFG.batonSockets - 1;

/** Player 1 under the pod the bead became, maw open, until it is taken. */
function catchIt(world: World): void {
  for (let i = 0; i < 20 * TPB && arm(world).stage === "falling"; i++) {
    const col = Math.round((world.pods[0]?.colMilli ?? 0) / 1000);
    step(world, [cmd(world, 1, { kind: "cannonCol", col }), cmd(world, 1, { kind: "intake" })]);
  }
}

describe("THE BATON's levels", () => {
  it("opens on the single level, and lights no second bead however dark the arm gets", () => {
    const world = open(QUIET, 3, 0);
    expect(batonLevel(arm(world))).toBe("single");
    for (let i = 0; i < CFG.batonTwinAfter + 2; i++) handover(world);
    expect(arm(world).beads).toHaveLength(1);
    expect(world.events.some((e) => e.type === "batonTwin")).toBe(false);
  });

  it("drops the one bead out of the last socket as a pod on a struck flight", () => {
    const world = open(QUIET, 3, 0);
    for (let i = 0; i < 40 && lead(world).socket < LAST; i++) handover(world);
    expect(lead(world).socket).toBe(LAST);
    handover(world);
    const b = arm(world);
    expect(b.stage).toBe("falling");
    expect(b.beads).toHaveLength(0);
    expect(world.pods).toHaveLength(1);
    expect(world.pods[0]?.id).toBe(b.podId);
  });

  it("folds, then unfolds again as the next level, every socket lit and one red bead on top", () => {
    const world = open(QUIET, 3, 0);
    until(world, "passing");
    for (let i = 0; i < 40 && arm(world).stage === "passing"; i++) handover(world);
    expect(arm(world).stage).toBe("falling");
    catchIt(world);
    expect(arm(world).stage).toBe("down");
    beats(world, CFG.batonDownBeats + 1);
    const next = arm(world);
    expect(next.level).toBe(1);
    expect(batonLevel(next)).toBe(BATON_LEVELS[1]);
    expect(next.stage).toBe("unfolding");
    expect(next.sockets.every((s) => s === BATON_SOCKET_LIT)).toBe(true);
    expect(next.beads).toHaveLength(1);
    expect(next.beads[0]?.socket).toBe(0);
    expect(next.beads[0]?.color).toBe("red");
    expect(next.lockUntil).toEqual([-1, -1]);
  });

  it("ends the wave's boss only after the last level folds", () => {
    expect(TWIN).toBe(BATON_LEVELS.length - 1);
  });
});

describe("THE BATON's bead answers either thumb", () => {
  it("sends the bead on player 2's tap, and locks her, not him", () => {
    const world = open();
    until(world, "passing");
    step(world, [
      cmd(world, 1, { kind: "cannonCol", col: arm(world).col }),
      cmd(world, 2, { kind: "guard" }),
    ]);
    const bead = flying(world);
    expect(bead).not.toBeNull();
    const b = arm(world);
    expect(batonLocked(b, 2, world.beat)).toBe(true);
    expect(batonLocked(b, 1, world.beat)).toBe(false);
    // **A bead she sent is not hers to strike.** Her lock runs out with the
    // bead still in the air, but a bolt from the hull cannot climb to it
    // before it lands: the turn is still two people's, whoever sends.
    for (let i = 0; i < 4 * TPB && batonLocked(b, 2, world.beat); i++) step(world, []);
    expect(bead?.flying).toBe(true);
    shoot(world, bead?.color ?? "red");
    landed(world);
    expect(bead?.struck).toBe(false);
    expect(bead?.socket).toBe(0);
  });

  it("swallows her tap while she is locked from a shot", () => {
    const world = open();
    until(world, "passing");
    step(world, [cmd(world, 2, { kind: "fire", color: "cyan" })]);
    expect(batonLocked(arm(world), 2, world.beat)).toBe(true);
    step(world, [cmd(world, 2, { kind: "guard" })]);
    expect(flying(world)).toBeNull();
  });
});
