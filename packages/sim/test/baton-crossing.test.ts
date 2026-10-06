import { describe, expect, it } from "bun:test";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  batonBeadRowMilli,
  batonLandTick,
  batonLocked,
  batonOneSegment,
  batonWaiting,
  failHolds,
  step,
} from "../src/index.js";
import {
  act,
  arm,
  beats,
  CFG,
  cmd,
  cross,
  handover,
  launch,
  lead,
  merged,
  nextBeat,
  open,
  QUIET,
  shoot,
  TPB,
  TWIN,
} from "./baton-fixture.js";

/**
 * THE BATON's end: the two beads merged in the last socket, the crossing —
 * an act a beat, in turn, to the end, or the whole arm back — and the drop
 * out of the last socket into the maw. Built on `QUIET`, so no shell falls
 * across the eleven handovers it takes to get there.
 */

const LAST = CFG.batonSockets - 1;

describe("THE BATON's merge and crossing", () => {
  it("holds the lead in the last socket, unlaunchable and unsettling, until the other arrives", () => {
    const world = open(QUIET);
    for (let i = 0; i < 40 && lead(world).socket < LAST; i++) handover(world);
    const b = arm(world);
    const wait = lead(world);
    expect(wait.socket).toBe(LAST);
    expect(b.beads).toHaveLength(2);
    expect(batonWaiting(CFG, b, wait)).toBe(true);
    // Left for longer than any turn, it stays put; the trigger sends the other.
    beats(world, CFG.batonTurnTopBeats * 3);
    expect(wait.socket).toBe(LAST);
    const other = launch(world);
    expect(other).not.toBe(wait);
    expect(wait.flying).toBe(false);
  });

  it("merges the two in the last socket, and the merged bead's next flight is the crossing", () => {
    const world = open(QUIET);
    merged(world);
    const b = arm(world);
    expect(b.beads).toHaveLength(1);
    expect(lead(world).socket).toBe(LAST);
    expect(lead(world).flying).toBe(false);
    expect(world.events.some((e) => e.type === "batonMerged")).toBe(true);
    const bead = launch(world);
    expect(b.stage).toBe("crossing");
    expect(bead.final).toBe(true);
    // The launch is the first act, his, and it locks him out as any launch does.
    expect(b.acts).toBe(1);
    expect(batonLocked(b, 1, world.beat)).toBe(true);
    expect(world.events.some((e) => e.type === "batonAct" && e.act === 0)).toBe(true);
    // Eleven beats long, straight down, and half way across at half time.
    expect(bead.col).toBe(bead.fromCol);
    const land = batonLandTick(CFG, bead);
    expect(land - bead.flightTick).toBeGreaterThan((CFG.batonFinalBeats - 1) * TPB);
    const row = batonBeadRowMilli(
      CFG,
      b,
      bead,
      bead.flightTick + Math.floor((land - bead.flightTick) / 2),
    );
    expect(row).toBeGreaterThan(LAST * 1000 + 400);
    expect(row).toBeLessThan(LAST * 1000 + 600);
  });

  it("comes down to one segment on the landing that leaves one socket lit, and stays so through a miss", () => {
    const world = open(QUIET);
    handover(world);
    expect(batonOneSegment(arm(world))).toBe(false);
    expect(arm(world).threadBeat).toBe(-1);
    for (let i = 0; i < 40 && lead(world).socket < LAST; i++) handover(world);
    const b = arm(world);
    expect(batonOneSegment(b)).toBe(true);
    expect(b.threadBeat).toBe(world.beat);
    const on = b.threadBeat;
    // The twin's landings down the dead sockets do not move the beat it was set on.
    merged(world);
    expect(b.threadBeat).toBe(on);
    expect(batonOneSegment(b)).toBe(true);
    launch(world);
    for (let i = 0; i <= CFG.batonTurnBottomBeats; i++) nextBeat(world);
    expect(b.stage).toBe("passing");
    // A miss costs the crossing, not the arm.
    expect(batonOneSegment(b)).toBe(true);
    expect(b.threadBeat).toBe(on);
  });

  it("owes acts on the crossing, in turn, and drops the bead once the flight is over", () => {
    const world = open(QUIET);
    cross(world);
    const b = arm(world);
    expect(b.stage).toBe("falling");
    expect(b.acts).toBe(CFG.batonFinalBeats);
    expect(b.sockets.every((s) => s === BATON_SOCKET_DARK)).toBe(true);
    expect(world.pods).toHaveLength(1);
    // The drop opens both locks: the catch under it is his.
    expect(batonLocked(b, 1, world.beat)).toBe(false);
  });

  it("flips the bead on every act of hers, so the colour language runs to the drop", () => {
    const world = open(QUIET);
    merged(world);
    const bead = launch(world);
    const before = bead.color;
    nextBeat(world);
    shoot(world, before);
    expect(arm(world).acts).toBe(2);
    expect(bead.color).not.toBe(before);
    expect(bead.flying).toBe(true);
    // And the wrong colour now is the colour that was right a beat ago, and
    // it knocks the bead out of the crossing, two sockets up the arm.
    nextBeat(world);
    act(world);
    nextBeat(world);
    shoot(world, before);
    expect(world.events.some((e) => e.type === "reject")).toBe(true);
    expect(arm(world).stage).toBe("passing");
    expect(bead.flying).toBe(false);
    expect(bead.final).toBe(false);
    expect(bead.socket).toBe(LAST - 2);
    expect(world.events.some((e) => e.type === "batonKicked")).toBe(true);
  });

  it("forgives an act off the beat, and puts the bead back in the last socket only after a long gap", () => {
    const world = open(QUIET);
    merged(world);
    const bead = launch(world);
    nextBeat(world);
    shoot(world, bead.color);
    // Her act made; his is next, and nobody presses — for as long as the
    // bottom socket's turn, the crossing waits.
    for (let i = 0; i < CFG.batonTurnBottomBeats; i++) {
      nextBeat(world);
      expect(arm(world).stage).toBe("crossing");
    }
    nextBeat(world);
    const b = arm(world);
    expect(b.stage).toBe("passing");
    expect(b.acts).toBe(0);
    expect(bead.flying).toBe(false);
    expect(bead.final).toBe(false);
    expect(bead.socket).toBe(LAST);
    // The arm the pair darkened stays dark: one lit socket, the one it sits in.
    expect(b.sockets.filter((s) => s === BATON_SOCKET_LIT)).toHaveLength(1);
    expect(b.merged).toBe(true);
    expect(world.events.some((e) => e.type === "batonMissed")).toBe(true);
    // One bead, and its next flight is the crossing again.
    launch(world);
    expect(b.beads).toHaveLength(1);
    expect(b.stage).toBe("crossing");
  });

  it("swallows the seat that just acted, so his trigger cannot make her act for her", () => {
    const world = open(QUIET);
    merged(world);
    const bead = launch(world);
    nextBeat(world);
    // Her beat: he is locked, and a press of his counts for nothing.
    expect(batonLocked(arm(world), 1, world.beat)).toBe(true);
    step(world, [cmd(world, 1, { kind: "guard" })]);
    expect(arm(world).acts).toBe(1);
    expect(bead.flying).toBe(true);
    for (let i = 1; i <= CFG.batonTurnBottomBeats; i++) nextBeat(world);
    expect(arm(world).stage).toBe("passing");
    expect(world.events.some((e) => e.type === "batonMissed")).toBe(true);
  });

  it("drops the bead out of the last socket as a pod, and the maw taking it is the arm beaten", () => {
    const world = open(QUIET);
    cross(world);
    const b = arm(world);
    expect(b.stage).toBe("falling");
    expect(b.merged).toBe(true);
    expect(b.beads).toHaveLength(0);
    expect(b.sockets.every((s) => s === BATON_SOCKET_DARK)).toBe(true);
    expect(world.pods).toHaveLength(1);
    expect(world.pods[0]?.id).toBe(b.podId);
    // Player 1 under it, maw open, until it arrives.
    for (let i = 0; i < 20 * TPB && b.stage === "falling"; i++) {
      step(world, [
        cmd(world, 1, {
          kind: "cannonCol",
          col: Math.round((world.pods[0]?.colMilli ?? 0) / 1000),
        }),
        cmd(world, 1, { kind: "intake" }),
      ]);
    }
    expect(b.stage).toBe("down");
    expect(world.events.some((e) => e.type === "batonDown")).toBe(true);
    expect(failHolds(world)).toBe(false);
    // The arm folds for its beats, then unfolds as the level after this one;
    // the last level's fold is the wave's end (`baton-arms.test.ts`).
    expect(world.boss).not.toBeNull();
    beats(world, CFG.batonDownBeats + 1);
    expect(arm(world).level).toBe(TWIN + 1);
    expect(arm(world).stage).toBe("unfolding");
  });
});
