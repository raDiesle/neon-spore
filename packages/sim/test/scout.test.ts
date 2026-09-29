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
  scoutLaunch,
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

/** Where the ship is let go: one tile above the middle of home, on 11 × 15 (5500, 13000). */
const LAUNCH = scoutLaunch(CFG);

/**
 * One arena, placed for the rig rather than for a player.
 *
 * The scout is let go one tile over the cannon pointing up with a mote four
 * tiles above it, so one held burn is the whole trip; the second mote is in a
 * corner nothing here ever reaches, and it is load-bearing — without it,
 * taking the one in the path would clear the arena and move the round on
 * under whichever test was watching it. The hazard sits far off to the left
 * and still, so it only arrives in the test that puts one on the ship.
 */
const ARENA: ScoutArena = {
  beats: 40,
  motes: [
    { colMilli: 5_500, rowMilli: 9_000 },
    { colMilli: 500, rowMilli: 500 },
  ],
  hazards: [{ colMilli: 1_000, rowMilli: 3_000, vColMilli: 0, vRowMilli: 0 }],
};

/** A second arena, so a cleared one has somewhere to go. */
const NEXT: ScoutArena = {
  beats: 20,
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

/** Hold a turn until the nose is on `headingMilli`, then let go. The nose steps, so it lands exactly. */
function face(world: World, headingMilli: number, dir: -1 | 1 = 1): void {
  step(world, [cmd(world, 1, { kind: "scoutTurn", on: true, dir })]);
  for (let i = 0; i < 8 * CFG.scoutTurnRepeatTicks; i++) {
    if (round(world).headingMilli === headingMilli) break;
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

/** Whether the ship is inside the mouth's reach: two tiles round the middle of home. */
function inReach(scout: ScoutState): boolean {
  const dCol = scout.colMilli - CFG.cols * 500;
  const dRow = scout.rowMilli - (CFG.rows * 1000 - 1_000);
  const reach = CFG.scoutSuckRadiusMilli;
  return dCol * dCol + dRow * dRow <= reach * reach;
}

/** Point the nose down and fly back into the mouth's reach. */
function goHome(world: World): boolean {
  face(world, 180_000);
  return burnUntil(world, inReach);
}

/** Tick until the ship is let go again, which is the tick the mouth swallowed it. */
function swallowed(world: World, ticks = 4 * TPB): boolean {
  const from = round(world).launchTick;
  for (let i = 0; i < ticks; i++) {
    step(world, []);
    if (round(world).launchTick !== from) return true;
  }
  return false;
}

describe("THE SCOUT", () => {
  it("lets the ship go one tile above the cannon as the round opens", () => {
    // The owner, 29 September 2026: *the ship should go out immediately when
    // wave starts, just one tile above cannon*. No lead, no drift into place.
    const world = open();
    play(world);
    expect(world.tick).toBeLessThanOrEqual(1);
    expect(round(world).colMilli).toBe(LAUNCH.colMilli);
    expect(round(world).rowMilli).toBe(LAUNCH.rowMilli);
    expect(LAUNCH.rowMilli).toBe(CFG.rows * 1000 - 2_000);
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
    expect(round(world).colMilli).toBe(LAUNCH.colMilli);
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

  it("steps the nose an eighth of a turn a press, and slowly while it is held", () => {
    // *It should snap each 45 degree and not so fast* — the cannon's feel.
    const world = open();
    play(world);
    press(world, 1, { kind: "scoutTurn", on: true, dir: 1 });
    expect(round(world).headingMilli).toBe(45_000);
    for (let i = 0; i < CFG.scoutTurnRepeatTicks - 2; i++) step(world, []);
    expect(round(world).headingMilli).toBe(45_000);
    for (let i = 0; i < 2; i++) step(world, []);
    expect(round(world).headingMilli).toBe(90_000);
    press(world, 1, { kind: "scoutTurn", on: false, dir: 1 }, 3 * CFG.scoutTurnRepeatTicks);
    expect(round(world).headingMilli).toBe(90_000);
    // And the other way, one press, one step.
    press(world, 1, { kind: "scoutTurn", on: true, dir: -1 });
    press(world, 1, { kind: "scoutTurn", on: false, dir: -1 });
    expect(round(world).headingMilli).toBe(45_000);
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

  it("carries one mote at a time and flies straight through the next", () => {
    // Two in the ship's line; the second is passed over while the first is aboard.
    const world = open([
      {
        ...ARENA,
        motes: [
          { colMilli: 5_500, rowMilli: 10_000 },
          { colMilli: 5_500, rowMilli: 7_000 },
          { colMilli: 500, rowMilli: 500 },
        ],
      },
    ]);
    play(world);
    burn(world, 4 * TPB);
    expect(round(world).rowMilli).toBeLessThan(7_000);
    expect(round(world).carrying).toEqual([0]);
  });

  it("banks it only when the mouth sucks the ship in, from two tiles off", () => {
    const world = open();
    play(world);
    burn(world, 3 * TPB);
    expect(round(world).carrying.length).toBe(1);

    // Home is the bottom middle, so the way back is a half turn and a burn.
    expect(goHome(world)).toBe(true);
    // Inside the reach with the mouth shut: nothing is lost and nothing is taken.
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(round(world).banked).toEqual([]);
    expect(round(world).carrying).toEqual([0]);
    expect(round(world).sucking).toBe(false);

    // Her press takes the ship; the pilot's hands are dead while it runs home.
    press(world, 2, { kind: "scoutMaw" });
    expect(round(world).sucking).toBe(true);
    expect(swallowed(world)).toBe(true);
    expect(round(world).banked).toEqual([0]);
    expect(round(world).carrying).toEqual([]);
    // And the ship is let go again, where the round began.
    expect(round(world).colMilli).toBe(LAUNCH.colMilli);
    expect(round(world).rowMilli).toBe(LAUNCH.rowMilli);
  });

  it("gives the pilot no mouth and the other seat no ship", () => {
    const world = open();
    play(world);
    // Player 2 cannot fly it.
    press(world, 2, { kind: "scoutBurn", on: true }, 20);
    expect(round(world).rowMilli).toBe(LAUNCH.rowMilli);
    expect(round(world).burning).toBe(false);
    // And player 1 cannot open the mouth.
    press(world, 1, { kind: "scoutMaw" });
    expect(round(world).mawTick).toBe(-1);
  });

  it("costs the hull when a hazard catches it, and that is the wave lost", () => {
    // One hazard, sitting exactly where the ship is let go.
    const world = open([{ ...ARENA, hazards: [{ ...LAUNCH, vColMilli: 0, vRowMilli: 0 }] }]);
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
    // One mote, right where the ship is let go — which is inside the reach.
    const world = open([{ ...ARENA, motes: [{ ...LAUNCH }], hazards: [] }, NEXT]);
    play(world);
    step(world, []);
    expect(round(world).carrying).toEqual([0]);
    press(world, 2, { kind: "scoutMaw" });
    for (let i = 0; i < 4 * TPB && round(world).arena === 0; i++) step(world, []);
    expect(round(world).arena).toBe(1);
    expect(round(world).colMilli).toBe(LAUNCH.colMilli);
    expect(round(world).rowMilli).toBe(LAUNCH.rowMilli);
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
