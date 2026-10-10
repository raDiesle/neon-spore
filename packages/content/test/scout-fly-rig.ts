import {
  createWorld,
  DEFAULT_CONFIG,
  MAZE_TURN,
  type SimConfig,
  scoutCarryLimit,
  scoutCurrent,
  scoutHome,
  scoutOpenRound,
  scoutPilot,
  scoutPrimeAsks,
  scoutRound,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { buildBoss } from "../src/queue.js";
import { WAVES } from "../src/waves.js";

/**
 * **The rig that flies a SCOUT arena**, for THE SCOUT's and THE HAUL's
 * clocks (`scout-flight.test.ts`, `scout-haul-flight.test.ts`): how long one
 * takes, measured rather than guessed.
 *
 * An arena's `beats` is the clock that ends it. The autopilot below is the
 * director's own hand (`hands/boss-hands-scout.ts`) written again, because
 * `content` does not depend on `hands` and a test is no reason for it to: the
 * two should be changed together.
 *
 * **The autopilot is deliberately stupid**, and that matters: it points the
 * nose at a mote in eighths of a turn, burns while it is aimed and under
 * speed, coasts, goes home once the hold is full or nothing is left out, and
 * primes when a heavy ship asks. It does not
 * dodge, brake or plan an order; the one thing it knows is to hold a burn a
 * hazard would catch. So the beats it takes are an *upper* bound on a
 * competent pair flying the same arena with one of them reading it out, and a
 * lower bound on nothing at all — which is the right side to set a clock from.
 */

export const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

/** Over half of a 45° step: a bearing on the boundary does not flap the nose. */
const SLACK = 27_500;

type Press = Omit<TimedCommand, "tick">;

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

/** One tick of the autopilot: the pilot's turn and burn, the navigator's mouth. */
function fly(w: World, look: boolean): Press[] {
  const s = scoutRound(w);
  if (s === null) return [];
  const arena = scoutCurrent(s);
  const next = arena.motes.find((_, i) => !s.banked.includes(i) && !s.carrying.includes(i));
  const full = s.carrying.length >= scoutCarryLimit(w.cfg, s);
  const want = full || next === undefined ? scoutHome(w.cfg.cols, w.cfg.rows) : next;
  const off = turnToward(
    s.headingMilli,
    bearing(want.colMilli - s.colMilli, want.rowMilli - s.rowMilli),
  );
  const out: Press[] = [];
  const pilot = scoutPilot(s);
  const aimed = Math.abs(off) <= SLACK;
  const speedSq = s.vColMilli * s.vColMilli + s.vRowMilli * s.vRowMilli;
  const cruising = speedSq >= (w.cfg.scoutMaxSpeedMilli / 2) * (w.cfg.scoutMaxSpeedMilli / 2);
  const dir = off > 0 ? 1 : -1;
  if (!aimed && s.turn !== dir)
    out.push({ player: pilot, command: { kind: "scoutTurn", dir, on: true } });
  else if (aimed && s.turn !== 0)
    out.push({ player: pilot, command: { kind: "scoutTurn", dir: 1, on: false } });
  const burn = aimed && !cruising && !(look && caughtFlyingOn(w));
  if (burn !== s.burning) out.push({ player: pilot, command: { kind: "scoutBurn", on: burn } });
  if (scoutPrimeAsks(w.cfg, s)) {
    const prime = { target: "scoutPrime", on: true, fromMilli: 0, fromYMilli: 0 } as const;
    out.push({ player: pilot, command: { kind: "drag", ...prime } });
  }
  out.push({ player: pilot === 1 ? 2 : 1, command: { kind: "scoutMaw" } });
  return out;
}

/** How far ahead a burn is asked about, in beats. */
const LOOK = 3;

/** Whether the autopilot, flown on from here for `LOOK` beats without looking, is caught. */
function caughtFlyingOn(from: World): boolean {
  const w = structuredClone(from);
  const s = scoutRound(w);
  if (s === null) return false;
  const arena = s.arena;
  for (let i = 0; i < LOOK * TPB; i++) {
    step(
      w,
      fly(w, false).map((c) => ({ ...c, tick: w.tick })),
    );
    // A copy that wins the arena is flying the next one, which is not this leg.
    if (s.arena !== arena) return false;
    if (s.caughtTick >= 0) return true;
  }
  return false;
}

/**
 * Fly arena `index` of wave `waveId` on the shipped figures and return the beats it took to
 * bank every mote, or `null` if the autopilot never managed it.
 *
 * **There is one flight and not a spread.** An arena is authored, its hazards
 * start where the author put them, and the autopilot is deterministic — so
 * this returns the same number every time it is asked, which is the point.
 */
export function beatsToClear(waveId: string, index: number, cap = 400): number | null {
  // The arenas as the game builds them, remapped onto the field's columns.
  const wave = WAVES.findIndex((w) => w.id === waveId);
  const world = createWorld(CFG, 7);
  startWave(world, wave, [], [], buildBoss(wave, CFG.cols));
  const scout = scoutRound(world);
  if (scout === null) throw new Error("no scout installed");
  // Straight to the arena under test: nothing headless can win to the second,
  // so it is stood up the way `bun run frames` stands it up.
  if (index > 0) {
    while (scout.phase !== "play") step(world, []);
    scoutOpenRound(world, scout, index);
  }
  const from = world.beat;
  const want = scoutCurrent(scout).motes.length;
  for (let i = 0; i < cap * TPB; i++) {
    if (scout.arena !== index || scout.caughtTick >= 0) return null;
    if (scout.banked.length >= want) return world.beat - from;
    step(
      world,
      fly(world, true).map((c) => ({ ...c, tick: world.tick })),
    );
  }
  return null;
}
