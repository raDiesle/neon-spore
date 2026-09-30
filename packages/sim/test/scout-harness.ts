import {
  createWorld,
  DEFAULT_CONFIG,
  type ScoutArena,
  type ScoutState,
  type SimConfig,
  scoutLaunch,
  scoutRound,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE SCOUT's rig, shared by `scout.test.ts` (the seats and what a mistake
 * costs) and `scout-trip.test.ts` (the flying and the carry home): the arenas
 * placed for a test rather than a player, and the presses every test is made of.
 */

export const CFG: SimConfig = DEFAULT_CONFIG;
export const TPB = ticksPerBeat(CFG);
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 6;

/** Where the ship is let go: one tile above the middle of home, on 11 × 15 (5500, 13000). */
export const LAUNCH = scoutLaunch(CFG);

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
export const ARENA: ScoutArena = {
  beats: 40,
  motes: [
    { colMilli: 5_500, rowMilli: 9_000 },
    { colMilli: 500, rowMilli: 500 },
  ],
  hazards: [{ colMilli: 1_000, rowMilli: 3_000, vColMilli: 0, vRowMilli: 0 }],
};

/** A second arena, so a cleared one has somewhere to go. */
export const NEXT: ScoutArena = {
  beats: 20,
  motes: [{ colMilli: 2_000, rowMilli: 2_000 }],
  hazards: [],
};

export function open(arenas: ScoutArena[] = [ARENA, NEXT], seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "scout", arenas });
  return world;
}

export function round(world: World): ScoutState {
  const scout = scoutRound(world);
  if (scout === null) throw new Error("no round running");
  return scout;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

/** Ticks to exactly the tick the scout is let go on, and no further. */
export function play(world: World): void {
  for (let i = 0; i < (CFG.scoutLeadBeats + 2) * TPB; i++) {
    if (round(world).phase === "play") return;
    step(world, []);
  }
  throw new Error("the round never let the ship go");
}

/** One tick with one press, then nothing for `ticks` more. */
export function press(
  world: World,
  player: 1 | 2,
  command: TimedCommand["command"],
  ticks = 0,
): void {
  step(world, [cmd(world, player, command)]);
  for (let i = 0; i < ticks; i++) step(world, []);
}

/** Burn for `ticks`, then let go. The whole of how anything moves in here. */
export function burn(world: World, ticks: number): void {
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
export function goHome(world: World): boolean {
  face(world, 180_000);
  return burnUntil(world, inReach);
}

/** Tick until the ship is let go again, which is the tick the mouth swallowed it. */
export function swallowed(world: World, ticks = 4 * TPB): boolean {
  const from = round(world).launchTick;
  for (let i = 0; i < ticks; i++) {
    step(world, []);
    if (round(world).launchTick !== from) return true;
  }
  return false;
}
