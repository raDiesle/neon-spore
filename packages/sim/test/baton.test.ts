import { describe, expect, it } from "bun:test";
import {
  BATON_SOCKET_DARK,
  BATON_SOCKET_LIT,
  BATON_SOCKET_SHED,
  type BatonBead,
  type BatonState,
  batonBaseCol,
  batonBoss,
  batonDark,
  batonLaunchable,
  batonLead,
  batonLocked,
  batonSocketCol,
  batonWaiting,
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
 * giving way, the second bead and the merge, and the drop out of the last
 * socket into the maw.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;
const MID = batonBaseCol(CFG);
const LAST = CFG.batonSockets - 1;

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

/** The bead furthest down the arm. */
function lead(world: World): BatonBead {
  const bead = batonLead(arm(world));
  if (bead === null) throw new Error("no bead on the arm");
  return bead;
}

/** The bead in the air, if one is. */
function flying(world: World): BatonBead | null {
  return arm(world).beads.find((bead) => bead.flying) ?? null;
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

/** Run until no bead is in the air. */
function landed(world: World): void {
  for (let i = 0; i < 40 * TPB && flying(world) !== null; i++) step(world, []);
  if (flying(world) !== null) throw new Error("the bead never came down");
}

/** Player 1 under the bead the trigger will send, then the trigger: it is in the air. */
function launch(world: World): BatonBead {
  until(world, "passing");
  const next = batonLaunchable(CFG, arm(world));
  if (next === null) throw new Error("nothing to launch");
  step(world, [
    cmd(world, 1, { kind: "cannonCol", col: batonSocketCol(arm(world), next.socket) }),
    cmd(world, 1, { kind: "guard" }),
  ]);
  const bead = flying(world);
  if (bead === null) throw new Error("the trigger sent nothing");
  return bead;
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
  const bead = launch(world);
  shoot(world, bead.color);
  expect(bead.struck).toBe(true);
  landed(world);
}

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

  it("shakes a bead that sat too long back to the base, and the dark sockets stay dark", () => {
    const world = open();
    handover(world);
    expect(lead(world).socket).toBe(1);
    const sat = world.beat;
    beats(world, CFG.batonTurnBeats);
    const b = arm(world);
    expect(lead(world).socket).toBe(0);
    expect(b.settles).toBe(1);
    expect(b.sockets[0]).toBe(BATON_SOCKET_DARK);
    expect(world.beat - sat).toBe(CFG.batonTurnBeats);
    expect(world.events.some((e) => e.type === "batonSettled")).toBe(true);
  });

  it("swings the arm once enough sockets are dark, and the bead lands a column off", () => {
    // One bead only: with two, the trigger's next is the twin, which does not swing.
    const world = open(3, { ...CFG, batonTwinAfter: CFG.batonSockets + 1 });
    for (let i = 0; i < CFG.batonSwingAfter; i++) handover(world);
    expect(batonDark(arm(world))).toBe(CFG.batonSwingAfter);
    const bead = launch(world);
    const b = arm(world);
    expect(bead.fromCol).toBe(MID);
    expect(bead.col).toBe(MID + 1);
    expect(b.col).toBe(MID + 1);
    shoot(world, bead.color);
    expect(bead.struck).toBe(true);
    landed(world);
    expect(bead.col).toBe(MID + 1);
  });

  it("sheds a shell down its own column once enough sockets are dark", () => {
    const world = open();
    // The second bead passes sockets already dark, so it takes more
    // handovers than dark sockets to get the arm giving way.
    for (let i = 0; i < 20 && batonDark(arm(world)) < CFG.batonShedAfter; i++) handover(world);
    expect(batonDark(arm(world))).toBe(CFG.batonShedAfter);
    // On the beat after the sixth landing, not on it: a shed is a thing the
    // arm does on its own count.
    beats(world, 1);
    const b = arm(world);
    const shedAt = b.sockets.indexOf(BATON_SOCKET_SHED);
    expect(shedAt).toBeGreaterThanOrEqual(0);
    // The topmost dark socket no bead sits in.
    for (let i = 0; i < shedAt; i++) {
      expect(b.sockets[i] === BATON_SOCKET_DARK).toBe(true);
      expect(b.beads.some((bead) => !bead.flying && bead.socket === i)).toBe(true);
    }
    const rock = world.creatures.find((c) => c.kind === "meteor");
    expect(rock?.col).toBe(b.col);
    expect(rock?.row).toBe(shedAt);
    expect(world.events.some((e) => e.type === "batonShed")).toBe(true);
  });

  it("lights a second bead in the top socket, the other colour, once enough sockets are dark", () => {
    const world = open();
    for (let i = 0; i < CFG.batonTwinAfter - 1; i++) handover(world);
    expect(arm(world).beads).toHaveLength(1);
    handover(world);
    const b = arm(world);
    expect(batonDark(b)).toBe(CFG.batonTwinAfter);
    expect(b.beads).toHaveLength(2);
    const twin = b.beads[1];
    expect(twin?.socket).toBe(0);
    expect(twin?.flying).toBe(false);
    expect(twin?.color).toBe(lead(world).color === "red" ? "cyan" : "red");
    expect(lead(world)).toBe(b.beads[0] as BatonBead);
    expect(world.events.some((e) => e.type === "batonTwin")).toBe(true);
  });

  it("takes turns under the one trigger: the bead that has sat longest goes, the other next", () => {
    // A long flight, so the third press finds both still in the air.
    const world = open(3, { ...CFG, batonFlightBeats: 6 });
    for (let i = 0; i < CFG.batonTwinAfter; i++) handover(world);
    const [first, twin] = arm(world).beads;
    if (first === undefined || twin === undefined) throw new Error("no twin");
    // Both sat down on the same beat: the lower one goes first.
    expect(launch(world)).toBe(first);
    expect(twin.flying).toBe(false);
    // Player 1 is locked for the beat after; then the twin, which has sat
    // longer, is the next one out — while the first is still in the air.
    beats(world, CFG.batonLockBeats + 1);
    expect(first.flying).toBe(true);
    step(world, [cmd(world, 1, { kind: "guard" })]);
    expect(twin.flying).toBe(true);
    expect(first.flying).toBe(true);
    // A third press sends nothing: both are in the air.
    beats(world, CFG.batonLockBeats + 1);
    step(world, [cmd(world, 1, { kind: "guard" })]);
    expect(world.events.some((e) => e.type === "batonLaunch")).toBe(false);
  });

  it("takes whichever bead the bolt reaches, by that bead's colour", () => {
    // A long flight, so both are in the air with time for a shot at each.
    const world = open(3, { ...CFG, batonFlightBeats: 9 });
    for (let i = 0; i < CFG.batonTwinAfter; i++) handover(world);
    const [first, twin] = arm(world).beads;
    if (first === undefined || twin === undefined) throw new Error("no twin");
    launch(world);
    beats(world, CFG.batonLockBeats + 1);
    step(world, [cmd(world, 1, { kind: "guard" })]);
    expect(first.flying && twin.flying).toBe(true);
    // The first is lower: a bolt up the column meets it, not the twin, and
    // the twin's colour is the wrong one for it.
    shoot(world, twin.color === first.color ? first.color : twin.color);
    if (twin.color === first.color) expect(first.struck).toBe(true);
    else {
      expect(first.struck).toBe(false);
      expect(world.events.some((e) => e.type === "reject")).toBe(true);
      beats(world, CFG.batonLockBeats + 1);
      shoot(world, first.color);
      expect(first.struck).toBe(true);
    }
    expect(twin.struck).toBe(false);
    // Then the twin, still above it in the air.
    beats(world, CFG.batonLockBeats + 1);
    shoot(world, twin.color);
    expect(twin.struck).toBe(true);
    landed(world);
    expect(first.socket).toBe(CFG.batonTwinAfter + 1);
    expect(twin.socket).toBe(1);
  });

  it("swings only the lead; the twin flies straight down the column it sat in", () => {
    const world = open();
    for (let i = 0; i < CFG.batonSwingAfter; i++) handover(world);
    const twin = arm(world).beads[1];
    if (twin === undefined) throw new Error("no twin");
    expect(launch(world)).toBe(twin);
    expect(twin.col).toBe(twin.fromCol);
    shoot(world, twin.color);
    landed(world);
    // Then the lead, which does — the first swing, since the twin's handover
    // darkened nothing new.
    const first = launch(world);
    expect(first).toBe(arm(world).beads[0] as BatonBead);
    expect(first.fromCol).toBe(MID);
    expect(first.col).toBe(MID + 1);
  });

  it("counts a bead's turn from the arm going still, never while the other flies", () => {
    const world = open();
    for (let i = 0; i < CFG.batonTwinAfter; i++) handover(world);
    const [first, twin] = arm(world).beads;
    if (first === undefined || twin === undefined) throw new Error("no twin");
    handover(world);
    // The first sat through the twin's whole flight; its clock starts now.
    expect(launch(world)).toBe(twin);
    shoot(world, twin.color);
    landed(world);
    expect(first.socket).toBe(CFG.batonTwinAfter + 1);
    beats(world, CFG.batonTurnBeats - 1);
    expect(first.socket).toBe(CFG.batonTwinAfter + 1);
    beats(world, 1);
    expect(first.socket).toBe(0);
  });

  it("keeps the two-beat turn while there are two beads, tight only when one is left", () => {
    const world = open();
    for (let i = 0; i < CFG.batonTightenAfter; i++) handover(world);
    const b = arm(world);
    expect(b.beads).toHaveLength(2);
    expect(b.handovers).toBe(CFG.batonTightenAfter);
    const bead = lead(world);
    const sat = world.beat;
    beats(world, CFG.batonTightTurnBeats);
    expect(bead.socket).toBe(CFG.batonTightenAfter);
    beats(world, CFG.batonTurnBeats - CFG.batonTightTurnBeats);
    expect(bead.socket).toBe(0);
    expect(world.beat - sat).toBe(CFG.batonTurnBeats);
  });

  it("holds the lead in the last socket, unlaunchable and unsettling, until the other arrives", () => {
    const world = open(3, { ...CFG, batonShedAfter: CFG.batonSockets + 1 });
    for (let i = 0; i < 40 && lead(world).socket < LAST; i++) handover(world);
    const b = arm(world);
    const wait = lead(world);
    expect(wait.socket).toBe(LAST);
    expect(b.beads).toHaveLength(2);
    expect(batonWaiting(CFG, b, wait)).toBe(true);
    // Left for longer than any turn, it stays put; the trigger sends the other.
    beats(world, CFG.batonTurnBeats * 3);
    expect(wait.socket).toBe(LAST);
    const other = launch(world);
    expect(other).not.toBe(wait);
    expect(wait.flying).toBe(false);
  });

  it("merges the two in the last socket, and the merged bead's next flight is the drop", () => {
    const world = open(3, { ...CFG, batonShedAfter: CFG.batonSockets + 1 });
    for (let i = 0; i < 40 && !arm(world).merged; i++) handover(world);
    const b = arm(world);
    expect(b.merged).toBe(true);
    expect(b.beads).toHaveLength(1);
    expect(lead(world).socket).toBe(LAST);
    expect(lead(world).flying).toBe(false);
    expect(world.events.some((e) => e.type === "batonMerged")).toBe(true);
    handover(world);
    expect(b.stage).toBe("falling");
    expect(world.pods).toHaveLength(1);
  });

  it("drops the bead out of the last socket as a pod, and the maw taking it is the arm beaten", () => {
    const world = open(3, { ...CFG, batonShedAfter: CFG.batonSockets + 1 });
    until(world, "passing");
    for (let i = 0; i < 40 && arm(world).stage === "passing"; i++) handover(world);
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
      for (let i = 0; i < CFG.batonTwinAfter + 1; i++) handover(world);
      launch(world);
      shoot(world, "cyan");
      landed(world);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
