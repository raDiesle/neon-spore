import {
  MAZE_TURN,
  type ScoutState,
  scoutCarryLimit,
  scoutCurrent,
  scoutHome,
  scoutNavigator,
  scoutPilot,
  scoutPrimeAsks,
  scoutRound,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { Hand } from "./hand.js";

/**
 * THE SCOUT: a deliberately stupid autopilot, lifted from
 * `content/test/scout-flight.test.ts`'s own — points the nose at the first
 * mote it has not got, burns while aimed and under half top speed, coasts
 * otherwise, and heads home once the hold is full (`scoutCarryLimit`) or
 * nothing is left out there — one mote a trip on THE SCOUT, the whole level on
 * THE HAUL. It puts a thumb on the thruster the moment a heavy ship asks
 * (`scoutPrimeAsks`) and never lifts it, and never reels: the line is a
 * choice, the prime is not. It plans no order and
 * leads no hazard.
 *
 * **It steers in eighths of a turn**, as the pilot's panel does since 29
 * September 2026 (`scoutTurnStep`): "aimed" is the nose within `SLACK` of the
 * bearing, a little over half a step, so a bearing that sits on the boundary
 * between two eighths does not have the nose flapping between them a tick at a
 * time. Off by more, it presses the turn that way, and a held turn steps again
 * on the round's own repeat.
 *
 * **It holds a burn that three beats of flying on would be caught after.** That
 * is the one thing it is not stupid about, and the reason it is its own file.
 * Until 23 September 2026 it held off a hazard inside a fixed box of rows and
 * columns; the second arena then put its motes on a 2.5-tile pitch with a
 * hazard between each pair of rows, and a box either held the ship at rest for
 * good or let it coast into the sweep. A ship at rest on a mote is clear of
 * both — that is what the pitch was widened for — so asking the round itself,
 * on a copy, is both the simple rule and the right one. It costs a copy a
 * burning tick, about a tenth of a second a pose.
 */

/** How far off the bearing the nose may be and still count as aimed: over half of a 45° step. */
const SLACK = 27_500;

/** How far ahead a burn is asked about, in beats. */
const LOOK_BEATS = 3;

type Press = Omit<TimedCommand, "tick">;

/** The pilot's prime: a thumb put on the thruster, held. */
const PRIME: Press["command"] = {
  kind: "drag",
  target: "scoutPrime",
  on: true,
  fromMilli: 0,
  fromYMilli: 0,
};

export const scoutHand: Hand = (w) => fly(w, true);

function fly(w: World, look: boolean): Press[] {
  const s = scoutRound(w);
  if (s === null) return [];
  const want = scoutTarget(w, s);
  const dc = want.colMilli - s.colMilli;
  const dr = want.rowMilli - s.rowMilli;
  const off = turnToward(s.headingMilli, scoutBearing(dc, dr));
  const out: Press[] = [];
  // The seats swap every arena (`scoutPilot`), so the hand asks whose they are.
  const pilot = scoutPilot(s);
  const aimed = Math.abs(off) <= SLACK;
  const speedSq = s.vColMilli * s.vColMilli + s.vRowMilli * s.vRowMilli;
  const cruising = speedSq >= (w.cfg.scoutMaxSpeedMilli / 2) * (w.cfg.scoutMaxSpeedMilli / 2);
  const dir = off > 0 ? 1 : -1;
  if (!aimed && s.turn !== dir) {
    out.push({ player: pilot, command: { kind: "scoutTurn", dir, on: true } });
  } else if (aimed && s.turn !== 0) {
    out.push({ player: pilot, command: { kind: "scoutTurn", dir: 1, on: false } });
  }
  const burn = aimed && !cruising && !(look && caughtFlyingOn(w));
  if (burn !== s.burning) out.push({ player: pilot, command: { kind: "scoutBurn", on: burn } });
  // A heavy ship's burn does not take unless it is primed: a thumb held on it.
  if (scoutPrimeAsks(w.cfg, s)) out.push({ player: pilot, command: PRIME });
  // The navigator holds the mouth open the whole flight — an open mouth costs
  // nothing, and this hand only has to arrive loaded, not play the maw well.
  out.push({ player: scoutNavigator(s), command: { kind: "scoutMaw" } });
  return out;
}

/** Whether the stupid hand, flown on from here for `LOOK_BEATS`, is caught. */
function caughtFlyingOn(w: World): boolean {
  const ahead = structuredClone(w);
  const s = scoutRound(ahead);
  if (s === null) return false;
  const ticks = LOOK_BEATS * ticksPerBeat(w.cfg);
  const arena = s.arena;
  for (let i = 0; i < ticks; i++) {
    step(
      ahead,
      fly(ahead, false).map((c) => ({ ...c, tick: ahead.tick })),
    );
    // A copy that wins the arena is flying the next one, which is not this leg.
    if (s.arena !== arena) return false;
    if (s.caughtTick >= 0) return true;
  }
  return false;
}

/** Where the scout is heading for: the first mote neither banked nor aboard, or home with a full hold or nothing left out. */
function scoutTarget(w: World, s: ScoutState): { colMilli: number; rowMilli: number } {
  const home = scoutHome(w.cfg.cols, w.cfg.rows);
  if (s.carrying.length >= scoutCarryLimit(w.cfg, s)) return home;
  const arena = scoutCurrent(s);
  for (let i = 0; i < arena.motes.length; i++) {
    if (s.banked.includes(i) || s.carrying.includes(i)) continue;
    const mote = arena.motes[i];
    if (mote !== undefined) return mote;
  }
  return home;
}

/** The heading, in thousandths of a degree, that points along `(dc, dr)`. 0 is straight up. */
function scoutBearing(dc: number, dr: number): number {
  const deg = (Math.atan2(dc, -dr) * 180_000) / Math.PI;
  return ((Math.round(deg) % MAZE_TURN) + MAZE_TURN) % MAZE_TURN;
}

/** The shortest way round from one heading to another, signed. */
function turnToward(from: number, to: number): number {
  const diff = (((to - from) % MAZE_TURN) + MAZE_TURN) % MAZE_TURN;
  return diff > MAZE_TURN / 2 ? diff - MAZE_TURN : diff;
}
