import { describe, expect, it } from "bun:test";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  batonArmCol,
  batonBaseCol,
  batonLaunchable,
  batonMergeSocket,
  batonSlot,
  batonSlotCol,
  step,
  type World,
} from "../src/index.js";
import {
  arm,
  beats,
  bothDown,
  CFG,
  cmd,
  cross,
  flying,
  handover,
  landed,
  merging,
  open,
  PAIR,
  QUIET,
  shoot,
  swelling,
  TPB,
  until,
} from "./baton-fixture.js";

/**
 * THE BATON's `pair` level (`sim/baton-arm.ts`): the second bead on an arm of
 * its own, a column either side of the centre — the owner, 6 October 2026,
 * *a second track directly beside the first*. One thing new over `twin`: the
 * cannon has to cross between two arms for every shot.
 */

const N = CFG.batonSockets;
const MID = batonBaseCol(CFG);

/** Player 1 under the catch, maw open, until the pod is taken. */
function catchIt(world: World): void {
  for (let i = 0; i < 20 * TPB && arm(world).stage === "falling"; i++) {
    const col = Math.round((world.pods[0]?.colMilli ?? 0) / 1000);
    step(world, [cmd(world, 1, { kind: "cannonCol", col }), cmd(world, 1, { kind: "intake" })]);
  }
}

describe("THE BATON's two arms", () => {
  it("hangs two arms a column either side of the centre, a bead lit in the top of each", () => {
    const b = arm(open(CFG, 3, PAIR));
    expect(b.sockets).toHaveLength(2 * N);
    expect(b.sockets.every((s) => s === BATON_SOCKET_LIT)).toBe(true);
    expect(b.beads.map((bead) => [bead.arm, bead.socket, bead.color, bead.col])).toEqual([
      [0, 0, "red", MID - 1],
      [1, 0, "cyan", MID + 1],
    ]);
    expect(batonArmCol(CFG, 2, 0)).toBe(MID - 1);
    expect(batonSlotCol(CFG, b, batonSlot(CFG, 1, 4))).toBe(MID + 1);
  });

  it("sends whichever bead sat longest, so the trigger goes arm to arm", () => {
    const world = open(QUIET, 3, PAIR);
    handover(world);
    const b = arm(world);
    expect(b.sockets[batonSlot(CFG, 0, 0)]).toBe(BATON_SOCKET_DARK);
    expect(b.sockets[batonSlot(CFG, 1, 0)]).toBe(BATON_SOCKET_LIT);
    expect(batonLaunchable(CFG, b)?.arm).toBe(1);
    handover(world);
    expect(b.sockets[batonSlot(CFG, 1, 0)]).toBe(BATON_SOCKET_DARK);
    expect(b.beads.map((bead) => bead.socket)).toEqual([1, 1]);
  });

  it("asks the cannon to cross: a shot left under the other arm meets nothing", () => {
    const world = open(QUIET, 3, PAIR);
    handover(world);
    until(world, "passing");
    // The right arm's bead goes, with the cannon still under the left arm.
    step(world, [cmd(world, 1, { kind: "guard" })]);
    const bead = flying(world);
    expect(bead?.arm).toBe(1);
    shoot(world, bead?.color ?? "red");
    landed(world);
    expect(bead?.struck).toBe(false);
    expect(bead?.socket).toBe(0);
  });

  it("swings each arm outward only, so the column between them stays clear", () => {
    const world = open(QUIET, 3, PAIR);
    const seen = [new Set<number>(), new Set<number>()];
    until(world, "passing");
    for (let i = 0; i < 2 * (N - 2) && arm(world).stage === "passing"; i++) {
      handover(world);
      for (const bead of arm(world).beads) seen[bead.arm]?.add(bead.col);
    }
    expect([...(seen[0] ?? [])].sort()).toEqual([MID - 2, MID - 1]);
    expect([...(seen[1] ?? [])].sort()).toEqual([MID + 1, MID + 2]);
  });

  it("drops a shell off the right arm down the right arm's column", () => {
    const world = open(CFG, 3, PAIR);
    const slot = swelling(world);
    const b = arm(world);
    const col = batonSlotCol(CFG, b, slot);
    for (let i = 0; i < CFG.batonSwellBeats * TPB && b.swellSocket >= 0; i++) step(world, []);
    const rock = world.creatures.find((c) => c.kind === "meteor");
    expect(rock?.col).toBe(col);
  });
});

describe("THE BATON's two arms drawn together", () => {
  it("hangs the two beads for the draw once each sits in its own arm's last socket", () => {
    const world = open(QUIET, 3, PAIR);
    merging(world);
    const b = arm(world);
    expect(b.beads.map((bead) => [bead.arm, bead.socket])).toEqual([
      [0, N - 1],
      [1, N - 1],
    ]);
    // By geometry: the pilot's thumb on the left arm, the navigator's on the right.
    expect(batonMergeSocket(CFG, b, 1)).toBe(batonSlot(CFG, 0, N - 1));
    expect(batonMergeSocket(CFG, b, 2)).toBe(batonSlot(CFG, 1, N - 1));
  });

  it("merges into the bead that waited, and its crossing and catch end the wave's boss", () => {
    const world = open(QUIET, 3, PAIR);
    merging(world);
    const waited = [...arm(world).beads].sort((a, b) => a.satBeat - b.satBeat)[0];
    bothDown(world, CFG.batonMergeWindowBeats);
    const b = arm(world);
    expect(b.merged).toBe(true);
    expect(b.beads[0]).toBe(waited as never);
    expect(b.beads).toHaveLength(1);
    expect(b.beads[0]?.arm).toBe(waited?.arm);
    cross(world);
    expect(arm(world).stage).toBe("falling");
    catchIt(world);
    expect(arm(world).stage).toBe("down");
    beats(world, CFG.batonDownBeats + 1);
    expect(world.boss).toBeNull();
  });
});
