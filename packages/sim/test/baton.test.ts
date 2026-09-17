import { describe, expect, it } from "bun:test";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  BATON_SOCKET_SHED,
  type BatonState,
  batonBaseCol,
  batonBoss,
  batonDark,
  batonLocked,
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE BATON, and the sentence it is built to make true: **whoever acted is
 * locked out for the beat after, so the two of you have to take turns**.
 *
 * What is checked is the handover — a launch from one seat, a strike from
 * the other, a landing the pair counted to — and the lock that makes it a
 * turn rather than a race. Then the two ways a handover is not made, the arm
 * giving way, and the drop out of the last socket into the maw.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;
const MID = batonBaseCol(CFG);

function open(seed = 3, cfg: SimConfig = CFG): World {
  const world = createWorld(cfg, seed);
  startWave(world, WAVE, [], [], { kind: "baton" });
  return world;
}

function arm(world: World): BatonState {
  const boss = batonBoss(world);
  if (boss === null) throw new Error("no arm installed");
  return boss;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

function beats(world: World, n: number): void {
  for (let i = 0; i < n * TPB; i++) step(world, []);
}

/** Run until the arm reaches a stage, or give up. Returns the beats it took. */
function until(world: World, stage: BatonState["stage"], cap = 40): number {
  const from = world.beat;
  for (let i = 0; i < cap * TPB; i++) {
    if (arm(world).stage === stage) return world.beat - from;
    step(world, []);
  }
  throw new Error(`the arm never reached ${stage}`);
}

/** Player 1 under the bead, then the trigger: the bead is in the air. */
function launch(world: World): void {
  until(world, "sitting");
  step(world, [
    cmd(world, 1, { kind: "cannonCol", col: arm(world).col }),
    cmd(world, 1, { kind: "guard" }),
  ]);
}

/** Player 2's bolt, and the ticks until it reaches the bead or the bead lands. */
function shoot(world: World, color: "red" | "cyan"): void {
  step(world, [cmd(world, 2, { kind: "fire", color })]);
  for (let i = 0; i < CFG.batonFlightBeats * TPB; i++) {
    if (world.bullets.length === 0) return;
    step(world, []);
  }
}

/** One whole handover, right colour: launched, struck, landed. */
function handover(world: World): void {
  launch(world);
  shoot(world, arm(world).color);
  expect(arm(world).struck).toBe(true);
  while (arm(world).stage === "flying") step(world, []);
}

describe("THE BATON", () => {
  it("opens unfolding, every socket lit, the bead red in the top socket and nobody locked", () => {
    const world = open();
    const b = arm(world);
    expect(b.stage).toBe("unfolding");
    expect(b.sockets).toHaveLength(CFG.batonSockets);
    expect(b.sockets.every((s) => s === BATON_SOCKET_LIT)).toBe(true);
    expect(b.socket).toBe(0);
    expect(b.color).toBe("red");
    expect(b.col).toBe(MID);
    expect(batonLocked(b, 1, world.beat)).toBe(false);
    expect(batonLocked(b, 2, world.beat)).toBe(false);
    // And a press while it unfolds is a press like any other: no lock yet.
    step(world, [cmd(world, 1, { kind: "cannonCol", col: 1 })]);
    expect(world.cannonCol).toBe(1);
  });

  it("unfolds one socket a beat and then sits", () => {
    const world = open();
    expect(until(world, "sitting")).toBe(CFG.batonSockets);
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
    expect(b.stage).toBe("flying");
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
    launch(world);
    const launchBeat = world.beat;
    shoot(world, "red");
    const b = arm(world);
    expect(b.struck).toBe(true);
    expect(world.balance.colorHits).toBe(1);
    expect(world.events.some((e) => e.type === "batonStruck")).toBe(true);
    // Player 2 is now the locked one.
    expect(batonLocked(b, 2, world.beat)).toBe(true);
    // The landing is on a beat the pair counted to.
    until(world, "sitting");
    expect(world.beat).toBe(launchBeat + CFG.batonFlightBeats);
    expect(b.socket).toBe(1);
    expect(b.sockets[0]).toBe(BATON_SOCKET_DARK);
    expect(b.color).toBe("cyan");
    expect(b.handovers).toBe(1);
    expect(world.events.some((e) => e.type === "batonLanded")).toBe(true);
  });

  it("rejects the wrong colour, and the bead lands back where it was", () => {
    const world = open();
    launch(world);
    shoot(world, "cyan");
    expect(arm(world).struck).toBe(false);
    expect(world.balance.colorMisses).toBe(1);
    expect(world.events.some((e) => e.type === "reject")).toBe(true);
    until(world, "sitting");
    const b = arm(world);
    expect(b.socket).toBe(0);
    expect(b.sockets[0]).toBe(BATON_SOCKET_LIT);
    expect(b.color).toBe("red");
    expect(b.handovers).toBe(0);
    expect(world.events.some((e) => e.type === "batonRelit")).toBe(true);
  });

  it("spends her turn on a shot at anything, not only one through the bead", () => {
    const world = open();
    until(world, "sitting");
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
    launch(world);
    const launchBeat = world.beat;
    step(world, [cmd(world, 2, { kind: "fire", color: "cyan" })]);
    const b = arm(world);
    expect(batonLocked(b, 2, world.beat)).toBe(true);
    // Her lock is shorter than the flight, so the next shot is still hers.
    beats(world, CFG.batonLockBeats + 1);
    expect(b.stage).toBe("flying");
    expect(world.beat).toBeLessThan(launchBeat + CFG.batonFlightBeats);
    expect(batonLocked(b, 2, world.beat)).toBe(false);
  });

  it("meets the bead with the beam, which stops there and spends her turn", () => {
    const world = open();
    until(world, "sitting");
    // The fill is as long as the flight, so it starts a beat before the launch
    // and tops out with the bead two-thirds of the way down its socket.
    step(world, [
      cmd(world, 1, { kind: "cannonCol", col: arm(world).col }),
      cmd(world, 2, { kind: "prime", on: true, color: "red" }),
    ]);
    beats(world, 1);
    step(world, [cmd(world, 1, { kind: "guard" })]);
    expect(arm(world).stage).toBe("flying");
    for (let i = 0; i < CFG.lancePrimeBeats * TPB && world.beam === null; i++) step(world, []);
    const beam = world.beam;
    if (beam === null) throw new Error("the lobe never fired");
    const b = arm(world);
    expect(b.stage).toBe("flying");
    expect(b.struck).toBe(true);
    expect(batonLocked(b, 2, world.beat)).toBe(true);
    expect(world.events.some((e) => e.type === "batonStruck")).toBe(true);
    // The beam ends at the bead: nothing above it in the column was reached.
    expect(beam.topMilli).toBeGreaterThan(0);
    until(world, "sitting");
    expect(b.socket).toBe(1);
    expect(b.handovers).toBe(1);
  });

  it("shakes a bead that sat too long back to the base, and the dark sockets stay dark", () => {
    const world = open();
    handover(world);
    expect(arm(world).socket).toBe(1);
    const sat = world.beat;
    beats(world, CFG.batonTurnBeats);
    const b = arm(world);
    expect(b.socket).toBe(0);
    expect(b.settles).toBe(1);
    expect(b.sockets[0]).toBe(BATON_SOCKET_DARK);
    expect(world.beat - sat).toBe(CFG.batonTurnBeats);
    expect(world.events.some((e) => e.type === "batonSettled")).toBe(true);
  });

  it("swings the arm once enough sockets are dark, and the bead lands a column off", () => {
    const world = open();
    for (let i = 0; i < CFG.batonSwingAfter; i++) handover(world);
    expect(batonDark(arm(world))).toBe(CFG.batonSwingAfter);
    launch(world);
    const b = arm(world);
    expect(b.fromCol).toBe(MID);
    expect(b.col).toBe(MID + 1);
    shoot(world, b.color);
    expect(b.struck).toBe(true);
    until(world, "sitting");
    expect(b.col).toBe(MID + 1);
  });

  it("sheds a shell down its own column once enough sockets are dark", () => {
    const world = open();
    for (let i = 0; i < CFG.batonShedAfter; i++) handover(world);
    // On the beat after the sixth landing, not on it: a shed is a thing the
    // arm does on its own count.
    beats(world, 1);
    const b = arm(world);
    expect(b.sockets[0]).toBe(BATON_SOCKET_SHED);
    const rock = world.creatures.find((c) => c.kind === "meteor");
    expect(rock?.col).toBe(b.col);
    expect(rock?.row).toBe(0);
    expect(world.events.some((e) => e.type === "batonShed")).toBe(true);
  });

  it("drops the bead out of the last socket as a pod, and the maw taking it is the arm beaten", () => {
    const world = open(3, { ...CFG, batonShedAfter: CFG.batonSockets + 1 });
    for (let i = 0; i < CFG.batonSockets; i++) handover(world);
    const b = arm(world);
    expect(b.stage).toBe("falling");
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
    // The arm folds for its beats, then the boss is gone and the wave may end.
    expect(world.boss).not.toBeNull();
    beats(world, CFG.batonDownBeats + 1);
    expect(world.boss).toBeNull();
  });

  it("holds the wave open while it stands, with nothing else on the field", () => {
    const world = open();
    beats(world, CFG.batonSockets + 4);
    expect(world.boss).not.toBeNull();
    expect(world.events.some((e) => e.type === "needWave")).toBe(false);
  });

  it("fingerprints the same run the same way twice", () => {
    const run = (): number => {
      const world = open(11);
      handover(world);
      launch(world);
      shoot(world, "cyan");
      until(world, "sitting");
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
