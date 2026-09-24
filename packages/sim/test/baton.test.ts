import { describe, expect, it } from "bun:test";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  batonBaseCol,
  batonLocked,
  failHolds,
  hashWorld,
  step,
} from "../src/index.js";
import {
  arm,
  beats,
  CFG,
  cmd,
  handover,
  landed,
  launch,
  lead,
  open,
  shoot,
  TPB,
  until,
} from "./baton-fixture.js";

/**
 * THE BATON, and the sentence it is built to make true: **whoever acted is
 * locked out for the beat after, so the two of you have to take turns**.
 *
 * What is checked here is the unfold and the handover — a launch from one
 * seat, a strike from the other, a landing the pair counted to — and the lock
 * that makes it a turn rather than a race. The arm giving way and the second
 * bead are `baton-swing.test.ts`; the merge, the crossing and the drop into
 * the maw are `baton-crossing.test.ts`. The rig is `baton-fixture.ts`.
 */

const MID = batonBaseCol(CFG);

describe("THE BATON", () => {
  it("opens unfolding, every socket lit, the bead red in the top socket and nobody locked", () => {
    const world = open();
    const b = arm(world);
    expect(b.stage).toBe("unfolding");
    expect(b.sockets).toHaveLength(CFG.batonSockets);
    expect(b.sockets.every((s) => s === BATON_SOCKET_LIT)).toBe(true);
    expect(b.beads).toHaveLength(1);
    expect(lead(world).socket).toBe(0);
    expect(lead(world).color).toBe("red");
    expect(b.col).toBe(MID);
    expect(batonLocked(b, 1, world.beat)).toBe(false);
    expect(batonLocked(b, 2, world.beat)).toBe(false);
    // And a press while it unfolds is a press like any other: no lock yet.
    step(world, [cmd(world, 1, { kind: "cannonCol", col: 1 })]);
    expect(world.cannonCol).toBe(1);
  });

  it("unfolds one socket a beat and then sits", () => {
    const world = open();
    expect(until(world, "passing")).toBe(CFG.batonSockets);
    expect(lead(world).flying).toBe(false);
  });

  it("does nothing for a trigger pressed before the bead sits", () => {
    const world = open();
    step(world, [cmd(world, 1, { kind: "guard" })]);
    expect(arm(world).stage).toBe("unfolding");
    expect(world.events.some((e) => e.type === "batonLaunch")).toBe(false);
  });

  it("launches on player 1's trigger and locks that seat out for the beat after", () => {
    const world = open();
    launch(world);
    const b = arm(world);
    expect(lead(world).flying).toBe(true);
    expect(world.events.some((e) => e.type === "batonLaunch")).toBe(true);
    expect(batonLocked(b, 1, world.beat)).toBe(true);
    expect(batonLocked(b, 2, world.beat)).toBe(false);
    // Swallowed, silently: the cannon does not move and nothing is charged.
    const before = world.cannonCol;
    step(world, [cmd(world, 1, { kind: "cannonCol", col: 1 })]);
    expect(world.cannonCol).toBe(before);
    expect(failHolds(world)).toBe(false);
    // The other seat is untouched, which is the whole of the alternation.
    step(world, [cmd(world, 2, { kind: "shieldCol", col: 1 })]);
    expect(world.shieldCol).toBe(1);
    // And the lock is one beat, not a freeze.
    beats(world, CFG.batonLockBeats + 1);
    step(world, [cmd(world, 1, { kind: "cannonCol", col: 1 })]);
    expect(world.cannonCol).toBe(1);
  });

  it("lets a locked seat leave the run, because a frozen pair is not a trapped one", () => {
    const world = open();
    launch(world);
    step(world, [cmd(world, 1, { kind: "restart" })]);
    expect(world.events.some((e) => e.type === "needWave")).toBe(true);
  });

  it("hands the bead over when player 2 puts the right colour through it", () => {
    const world = open();
    const bead = launch(world);
    const launchBeat = world.beat;
    shoot(world, "red");
    const b = arm(world);
    expect(bead.struck).toBe(true);
    expect(world.balance.colorHits).toBe(1);
    expect(world.events.some((e) => e.type === "batonStruck")).toBe(true);
    // Player 2 is now the locked one.
    expect(batonLocked(b, 2, world.beat)).toBe(true);
    // The landing is on a beat the pair counted to.
    landed(world);
    expect(world.beat).toBe(launchBeat + CFG.batonFlightBeats);
    expect(bead.socket).toBe(1);
    expect(b.sockets[0]).toBe(BATON_SOCKET_DARK);
    expect(bead.color).toBe("cyan");
    expect(b.handovers).toBe(1);
    expect(world.events.some((e) => e.type === "batonLanded")).toBe(true);
  });

  it("rejects the wrong colour, and the bead lands back where it was", () => {
    const world = open();
    const bead = launch(world);
    shoot(world, "cyan");
    expect(bead.struck).toBe(false);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.events.some((e) => e.type === "reject")).toBe(true);
    landed(world);
    const b = arm(world);
    expect(bead.socket).toBe(0);
    expect(b.sockets[0]).toBe(BATON_SOCKET_LIT);
    expect(bead.color).toBe("red");
    expect(b.handovers).toBe(0);
    expect(world.events.some((e) => e.type === "batonRelit")).toBe(true);
  });

  it("spends her turn on a shot at anything, not only one through the bead", () => {
    const world = open();
    until(world, "passing");
    // The cannon a column off the arm: the bolt meets nothing and the bead is
    // not in the air anyway. The act is the shot leaving.
    step(world, [cmd(world, 1, { kind: "cannonCol", col: MID + 2 })]);
    expect(batonLocked(arm(world), 2, world.beat)).toBe(false);
    step(world, [cmd(world, 2, { kind: "fire", color: "cyan" })]);
    expect(world.bullets.length).toBe(1);
    expect(batonLocked(arm(world), 2, world.beat)).toBe(true);
    expect(batonLocked(arm(world), 1, world.beat)).toBe(false);
    beats(world, CFG.batonLockBeats + 1);
    expect(batonLocked(arm(world), 2, world.beat)).toBe(false);
  });

  it("spends nothing on a shot before the bead first sits", () => {
    const world = open();
    expect(arm(world).stage).toBe("unfolding");
    step(world, [cmd(world, 2, { kind: "fire", color: "cyan" })]);
    expect(world.bullets.length).toBe(1);
    expect(batonLocked(arm(world), 2, world.beat)).toBe(false);
  });

  it("costs her the beat on the wrong colour too, and gives it back before the bead lands", () => {
    const world = open();
    const bead = launch(world);
    const launchBeat = world.beat;
    step(world, [cmd(world, 2, { kind: "fire", color: "cyan" })]);
    const b = arm(world);
    expect(batonLocked(b, 2, world.beat)).toBe(true);
    // Her lock is shorter than the flight, so the next shot is still hers.
    beats(world, CFG.batonLockBeats + 1);
    expect(bead.flying).toBe(true);
    expect(world.beat).toBeLessThan(launchBeat + CFG.batonFlightBeats);
    expect(batonLocked(b, 2, world.beat)).toBe(false);
  });

  it("meets the bead with the beam, which stops there and spends her turn", () => {
    const world = open();
    until(world, "passing");
    // The fill is as long as the flight, so it starts a beat before the launch
    // and tops out with the bead two-thirds of the way down its socket.
    step(world, [
      cmd(world, 1, { kind: "cannonCol", col: arm(world).col }),
      cmd(world, 2, { kind: "prime", on: true, color: "red" }),
    ]);
    beats(world, 1);
    step(world, [cmd(world, 1, { kind: "guard" })]);
    const bead = lead(world);
    expect(bead.flying).toBe(true);
    for (let i = 0; i < CFG.lancePrimeBeats * TPB && world.beam === null; i++) step(world, []);
    const beam = world.beam;
    if (beam === null) throw new Error("the lobe never fired");
    const b = arm(world);
    expect(bead.flying).toBe(true);
    expect(bead.struck).toBe(true);
    expect(batonLocked(b, 2, world.beat)).toBe(true);
    expect(world.events.some((e) => e.type === "batonStruck")).toBe(true);
    // The beam ends at the bead: nothing above it in the column was reached.
    expect(beam.topMilli).toBeGreaterThan(0);
    landed(world);
    expect(bead.socket).toBe(1);
    expect(b.handovers).toBe(1);
  });

  it("holds the wave open while it stands, with nothing else on the field", () => {
    const world = open();
    beats(world, CFG.batonSockets + 4);
    expect(world.boss).not.toBeNull();
    expect(world.events.some((e) => e.type === "needWave")).toBe(false);
  });

  it("fingerprints the same run the same way twice", () => {
    const run = (): number => {
      const world = open(CFG, 11);
      for (let i = 0; i < CFG.batonTwinAfter + 1; i++) handover(world);
      launch(world);
      shoot(world, "cyan");
      landed(world);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
