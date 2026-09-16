import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  failHolds,
  hashWorld,
  type ScoutArena,
  type ScoutState,
  type SimConfig,
  scoutCleared,
  scoutLeft,
  scoutRound,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE SCOUT, and the sentence it is built to make true: **one of you flies it
 * and the other one can see where it is going**.
 *
 * Player 1 has the two turns and the burn and is shown the ship; player 2 has
 * the mother ship's mouth and is shown the arena. Everything checked here is
 * either that split, the flying itself, or what it costs to get it wrong — a
 * hazard's touch and the clock, which are one rule wearing two coats, and the
 * rule is the field's: a hit is the wave lost (`wave-fail.ts`).
 *
 * **The flying is checked as arithmetic rather than as feel.** Whether it is
 * fluent is the owner's to say and nothing here pretends otherwise; what a
 * test can hold is that a burn goes where the nose points, that letting go
 * brings the ship to rest, and that neither ever leaves the arena.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 6;

/**
 * One arena, placed for the rig rather than for a player.
 *
 * The scout starts dead centre pointing up with a mote four tiles above it, so
 * one held burn is the whole trip; the second mote is in a corner nothing here
 * ever reaches, and it is load-bearing — without it, taking the one in the
 * path would clear the arena and move the round on under whichever test was
 * watching it. The hazard sits far off to the left travelling away, so it only
 * arrives in the test that flies at it.
 */
const ARENA: ScoutArena = {
  beats: 40,
  startColMilli: 5_500,
  startRowMilli: 7_500,
  startHeadingMilli: 0,
  motes: [
    { colMilli: 5_500, rowMilli: 3_500 },
    { colMilli: 500, rowMilli: 500 },
  ],
  hazards: [{ colMilli: 1_000, rowMilli: 13_000, vColMilli: 0, vRowMilli: 0 }],
};

/** A second arena, so a cleared one has somewhere to go. */
const NEXT: ScoutArena = {
  beats: 20,
  startColMilli: 2_000,
  startRowMilli: 9_000,
  startHeadingMilli: 90_000,
  motes: [{ colMilli: 2_000, rowMilli: 2_000 }],
  hazards: [],
};

function open(arenas: ScoutArena[] = [ARENA, NEXT], seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "scout", arenas });
  return world;
}

function round(world: World): ScoutState {
  const scout = scoutRound(world);
  if (scout === null) throw new Error("no round running");
  return scout;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

/** Ticks to exactly the tick the scout is let go on, and no further. */
function play(world: World): void {
  for (let i = 0; i < (CFG.scoutLeadBeats + 2) * TPB; i++) {
    if (round(world).phase === "play") return;
    step(world, []);
  }
  throw new Error("the round never let the ship go");
}

/** One tick with one press, then nothing for `ticks` more. */
function press(world: World, player: 1 | 2, command: TimedCommand["command"], ticks = 0): void {
  step(world, [cmd(world, player, command)]);
  for (let i = 0; i < ticks; i++) step(world, []);
}

/** Burn for `ticks`, then let go. The whole of how anything moves in here. */
function burn(world: World, ticks: number): void {
  press(world, 1, { kind: "scoutBurn", on: true }, ticks - 1);
  press(world, 1, { kind: "scoutBurn", on: false });
}

/**
 * Turn until the nose is pointing where it was asked to, then stop.
 *
 * A count of ticks would be frame-perfect arithmetic in a test about
 * something else — and off by exactly one tick, because the tick a press
 * arrives on is a tick the nose also turns on. Asking the heading is what a
 * pair does anyway.
 */
function face(world: World, headingMilli: number, dir: -1 | 1 = 1): void {
  step(world, [cmd(world, 1, { kind: "scoutTurn", on: true, dir })]);
  for (let i = 0; i < 80; i++) {
    if (Math.abs(round(world).headingMilli - headingMilli) < CFG.scoutTurnMilliDeg) break;
    step(world, []);
  }
  press(world, 1, { kind: "scoutTurn", on: false, dir });
}

/** Burn until `done` is true of the round, or give up. */
function burnUntil(world: World, done: (scout: ScoutState) => boolean, ticks = 6 * TPB): boolean {
  step(world, [cmd(world, 1, { kind: "scoutBurn", on: true })]);
  let reached = false;
  for (let i = 0; i < ticks && !reached; i++) {
    step(world, []);
    reached = done(round(world));
  }
  press(world, 1, { kind: "scoutBurn", on: false });
  return reached;
}

/** Whether the ship is over the mother ship, which is the bottom middle. */
function atHome(scout: ScoutState): boolean {
  const dCol = scout.colMilli - CFG.cols * 500;
  const dRow = scout.rowMilli - (CFG.rows * 1000 - 1_000);
  const reach = CFG.scoutRadiusMilli + CFG.scoutHomeRadiusMilli;
  return dCol * dCol + dRow * dRow <= reach * reach;
}

/** Point the nose down and fly back to the mother ship. */
function goHome(world: World): boolean {
  face(world, 180_000);
  return burnUntil(world, atHome);
}

describe("THE SCOUT", () => {
  it("holds the ship still until the mother ship has opened", () => {
    const world = open();
    const scout = round(world);
    expect(scout.phase).toBe("lead");
    const where = scout.rowMilli;
    // A burn during the lead is a press nobody meant: the pair are reading two
    // screens that have just stopped being the field.
    burn(world, TPB);
    expect(round(world).rowMilli).toBe(where);
    expect(round(world).vRowMilli).toBe(0);
  });

  it("flies where the nose points, and coasts after the thumb comes off", () => {
    const world = open();
    play(world);
    const from = round(world).rowMilli;
    burn(world, 20);
    // Numbers and not the round itself: the state is live, and a test holding
    // a reference to it compares a field with itself.
    const coasting = round(world).rowMilli;
    const speed = Math.abs(round(world).vRowMilli);
    // Up the arena is a falling row number, and the column has not moved: a
    // burn is along the nose and nowhere else.
    expect(coasting).toBeLessThan(from);
    expect(round(world).colMilli).toBe(ARENA.startColMilli);
    for (let i = 0; i < 10; i++) step(world, []);
    // Still going with nothing held — that is the whole difference between a
    // ship and a cursor — and slowing down.
    expect(round(world).rowMilli).toBeLessThan(coasting);
    expect(Math.abs(round(world).vRowMilli)).toBeLessThan(speed);
  });

  it("comes to rest inside a couple of beats, which is what makes it easy", () => {
    const world = open();
    play(world);
    burn(world, 30);
    for (let i = 0; i < 2 * TPB; i++) step(world, []);
    expect(Math.abs(round(world).vRowMilli)).toBeLessThan(200);
  });

  it("turns the nose while the finger is down and leaves it where it stopped", () => {
    const world = open();
    play(world);
    press(world, 1, { kind: "scoutTurn", on: true, dir: 1 }, 9);
    const turned = round(world).headingMilli;
    expect(turned).toBeGreaterThan(0);
    press(world, 1, { kind: "scoutTurn", on: false, dir: 1 }, 10);
    expect(round(world).headingMilli).toBe(turned);
  });

  it("never leaves the arena, however long the burn is held", () => {
    const world = open();
    play(world);
    burn(world, 8 * TPB);
    const scout = round(world);
    expect(scout.rowMilli).toBeGreaterThanOrEqual(CFG.scoutRadiusMilli);
    expect(scout.colMilli).toBeGreaterThanOrEqual(CFG.scoutRadiusMilli);
    expect(scout.rowMilli).toBeLessThanOrEqual(CFG.rows * 1000);
    // And the wall is not a hazard: the wave is still being played.
    expect(failHolds(world)).toBe(false);
  });

  it("picks a mote up by flying over it and does not have it yet", () => {
    const world = open();
    play(world);
    burn(world, 3 * TPB);
    const scout = round(world);
    expect(scout.carrying).toEqual([0]);
    expect(scout.banked).toEqual([]);
    expect(scoutCleared(scout)).toBe(false);
    // Two motes authored, and neither is home: the count the seat reads is
    // what is still owed rather than what is still out there.
    expect(scoutLeft(scout)).toBe(2);
  });

  it("only banks it at the mother ship, and only with the mouth open", () => {
    const world = open();
    play(world);
    burn(world, 3 * TPB);
    expect(round(world).carrying.length).toBe(1);

    // Home is the bottom middle, so the way back is a half turn and a burn.
    expect(goHome(world)).toBe(true);
    // Arrived with the mouth shut: nothing is lost and nothing is taken.
    expect(round(world).banked).toEqual([]);
    expect(round(world).carrying).toEqual([0]);

    press(world, 2, { kind: "scoutMaw" }, 2);
    expect(round(world).banked).toEqual([0]);
    expect(round(world).carrying).toEqual([]);
  });

  it("gives the pilot no mouth and the other seat no ship", () => {
    const world = open();
    play(world);
    // Player 2 cannot fly it.
    press(world, 2, { kind: "scoutBurn", on: true }, 20);
    expect(round(world).rowMilli).toBe(ARENA.startRowMilli);
    expect(round(world).burning).toBe(false);
    // And player 1 cannot open the mouth.
    press(world, 1, { kind: "scoutMaw" });
    expect(round(world).mawTick).toBe(-1);
  });

  it("costs the hull when a hazard catches it, and that is the wave lost", () => {
    // One hazard, sitting exactly where the ship is let go.
    const world = open([
      { ...ARENA, hazards: [{ colMilli: 5_500, rowMilli: 7_500, vColMilli: 0, vRowMilli: 0 }] },
    ]);
    play(world);
    step(world, []);
    expect(round(world).caughtTick).toBeGreaterThanOrEqual(0);
    expect(round(world).caughtBy).toBe(0);
    // A breach rather than a number: the hull's own bookkeeping is
    // `hull-damage.ts`'s, and what this round owes is the event and the loss.
    expect(world.events.some((e) => e.type === "breach")).toBe(true);
    expect(failHolds(world)).toBe(true);
  });

  it("costs the hull when the clock runs out with a mote still owed", () => {
    const world = open([{ ...ARENA, beats: 2 }]);
    play(world);
    let breached = false;
    for (let i = 0; i < 4 * TPB && !breached; i++) {
      step(world, []);
      // Asked on the tick rather than at the end: the events are this tick's
      // and the next tick is a fresh list.
      breached = world.events.some((e) => e.type === "breach");
    }
    expect(breached).toBe(true);
    expect(round(world).passed).toBe(false);
    expect(failHolds(world)).toBe(true);
  });

  it("opens the next arena when every mote is home", () => {
    // One mote, right where the ship is let go, and home under it.
    const world = open([
      { ...ARENA, motes: [{ colMilli: 5_500, rowMilli: 7_500 }], hazards: [] },
      NEXT,
    ]);
    play(world);
    step(world, []);
    expect(round(world).carrying).toEqual([0]);
    expect(goHome(world)).toBe(true);
    press(world, 2, { kind: "scoutMaw" }, 4);
    expect(round(world).arena).toBe(1);
    expect(round(world).colMilli).toBe(NEXT.startColMilli);
    expect(round(world).banked).toEqual([]);
  });

  it("flies the same ship on two devices", () => {
    // The point of every integer in the round: the same presses on the same
    // ticks are the same world, to the fingerprint (`docs/decisions.md` #23).
    const a = open();
    const b = open();
    for (const world of [a, b]) {
      play(world);
      press(world, 1, { kind: "scoutTurn", on: true, dir: -1 }, 7);
      press(world, 1, { kind: "scoutTurn", on: false, dir: -1 });
      burn(world, 40);
      press(world, 2, { kind: "scoutMaw" }, 30);
    }
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
