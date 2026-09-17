import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  MAZE_TURN,
  type ScoutState,
  type SimConfig,
  scoutRound,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { SCOUT_ARENAS } from "../src/scout-arenas.js";

/**
 * **How long THE SCOUT's arenas take to fly**, measured rather than guessed.
 *
 * An arena's `beats` is the clock that ends it, and until this file existed the
 * two figures had been chosen against nothing: 40 and 56, against a flight
 * nobody had timed. A session did time one, with an autopilot it wrote in a
 * scratch file and threw away — so the figure it produced could not be checked
 * by the session that came next, which is the whole reason this is a test and
 * not a probe.
 *
 * **The autopilot is deliberately stupid**, and that matters: it points the
 * nose at a mote, burns while it is aimed and under speed, coasts, and goes
 * home when it is carrying everything. It does not dodge, lead a hazard or
 * plan an order. So the beats it takes are an *upper* bound on a competent
 * pair flying the same arena with one of them reading it out, and a lower
 * bound on nothing at all — which is the right side to set a clock from.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

/** Where the mother ship sits, which is where a mote is banked. */
function home(cfg: SimConfig): { colMilli: number; rowMilli: number } {
  return { colMilli: cfg.cols * 500, rowMilli: cfg.rows * 1_000 - 1_000 };
}

/** The heading, in thousandths of a degree, that points along `(dc, dr)`. */
function bearing(dc: number, dr: number): number {
  const deg = (Math.atan2(dc, -dr) * 180_000) / Math.PI;
  return ((Math.round(deg) % MAZE_TURN) + MAZE_TURN) % MAZE_TURN;
}

/** The shortest way round from `from` to `to`, signed. */
function turnToward(from: number, to: number): number {
  const diff = (((to - from) % MAZE_TURN) + MAZE_TURN) % MAZE_TURN;
  return diff > MAZE_TURN / 2 ? diff - MAZE_TURN : diff;
}

/** What the scout is heading for: the first mote it has not got, else home. */
function target(cfg: SimConfig, scout: ScoutState) {
  const arena = scout.arenas[scout.arena];
  if (arena === undefined) throw new Error("no arena");
  for (let i = 0; i < arena.motes.length; i++) {
    if (scout.carrying.includes(i) || scout.banked.includes(i)) continue;
    const mote = arena.motes[i];
    if (mote !== undefined) return mote;
  }
  return home(cfg);
}

/** One tick of the autopilot: the pilot's two holds and the navigator's press. */
function fly(world: World, scout: ScoutState): TimedCommand[] {
  const want = target(CFG, scout);
  const dc = want.colMilli - scout.colMilli;
  const dr = want.rowMilli - scout.rowMilli;
  const off = turnToward(scout.headingMilli, bearing(dc, dr));
  const out: TimedCommand[] = [];
  const aimed = Math.abs(off) <= CFG.scoutTurnMilliDeg;
  const speedSq = scout.vColMilli * scout.vColMilli + scout.vRowMilli * scout.vRowMilli;
  // Half the top speed, squared: fast enough to cross an arena, slow enough
  // that the nose can still be brought round before the wall.
  const cruising = speedSq >= (CFG.scoutMaxSpeedMilli / 2) * (CFG.scoutMaxSpeedMilli / 2);
  const dir = off > 0 ? 1 : -1;
  if (!aimed && scout.turn !== dir) {
    out.push({ tick: world.tick, player: 1, command: { kind: "scoutTurn", dir, on: true } });
  } else if (aimed && scout.turn !== 0) {
    out.push({ tick: world.tick, player: 1, command: { kind: "scoutTurn", dir: 1, on: false } });
  }
  const burn = aimed && !cruising;
  if (burn !== scout.burning) {
    out.push({ tick: world.tick, player: 1, command: { kind: "scoutBurn", on: burn } });
  }
  // The navigator holds the mouth open the whole time. A mote only comes off at
  // home, so an open mouth costs nothing and this test is not about that press.
  out.push({ tick: world.tick, player: 2, command: { kind: "scoutMaw" } });
  return out;
}

/**
 * Fly arena `index` on the shipped figures and return the beats it took to
 * bank every mote, or `null` if the autopilot never managed it.
 *
 * **There is one flight and not a spread.** An arena is authored, its hazards
 * start where the author put them, and the autopilot is deterministic — so
 * this returns the same number every time it is asked, which is the point.
 * What varies between two *pairs* is how long they spend talking, and no rig
 * measures that; what the clock has to leave room for is that talking, on top
 * of the number below.
 */
function beatsToClear(index: number, cap = 400): number | null {
  const world = createWorld(CFG, 7);
  startWave(world, 6, [], [], { kind: "scout", arenas: SCOUT_ARENAS });
  const scout = scoutRound(world);
  if (scout === null) throw new Error("no scout installed");
  // Straight to the arena under test, past the round's own lead-in.
  while (scout.arena < index && world.tick < cap * TPB) step(world, []);
  const from = world.beat;
  const want = SCOUT_ARENAS[index]?.motes.length ?? 0;
  for (let i = 0; i < cap * TPB; i++) {
    if (scout.arena !== index) return null;
    if (scout.banked.length >= want) return world.beat - from;
    step(world, fly(world, scout));
  }
  return null;
}

describe("THE SCOUT's arenas, flown", () => {
  it("flies the first arena in twelve beats on the shipped figures", () => {
    // The figure the clock is set from. A change to the arena's motes, its
    // hazard or the flight constants moves it, and moving it should have to be
    // written down rather than noticed later by somebody timing it again.
    expect(beatsToClear(0)).toBe(12);
  });

  it("leaves the first arena's clock a thing a pair can run out of", () => {
    const clock = SCOUT_ARENAS[0]?.beats ?? 0;
    const flight = beatsToClear(0);
    if (flight === null) throw new Error("the first arena was not flown");
    // `ranOut` in `sim/scout-arena.ts` is one of the two ways this round breaks
    // the hull and half of what the spec's section promises. A clock a rig
    // clears in a third of is not a clock, it is a backstop against a pair who
    // have stopped flying. Twice the flight is the bar: room to read the arena
    // out loud, and not three times over.
    expect(clock).toBeLessThanOrEqual(flight * 2);
    expect(clock).toBeGreaterThan(flight);
  });
});
