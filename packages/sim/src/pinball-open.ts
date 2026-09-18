import type { PinballRound, PinballState } from "./pinball.js";
import type { World } from "./world.js";

/**
 * **Standing PINBALL up**: one round opened, the board loaded onto the table,
 * and the two questions everything else asks about it.
 *
 * Cut off `pinball.ts` on `snake-open.ts`' terms and for its reason — that
 * file is the *shape* of the round and nothing in it needs a world, and this
 * is the half that does. The seam was already drawn in the shape file's own
 * header before there was a file on the other side of it.
 */

export function openPinball(world: World, rounds: readonly PinballRound[]): PinballState {
  // A wave that carries this boss and authors nothing is a round with no way
  // to end — SNAKE's objection, and it is worth the same throw.
  if (rounds.length === 0) throw new Error("a pinball wave with no rounds is not a round");
  const state: PinballState = {
    kind: "pinball",
    phase: "morph",
    phaseBeat: world.beat,
    openBeat: world.beat,
    passed: false,
    rounds: rounds.map((r) => ({ beats: r.beats, pieces: r.pieces.map((p) => ({ ...p })) })),
    round: 0,
    roundBeat: world.beat,
    pieces: [],
    alive: [],
    lit: [],
    shot: "aim",
    angleMilli: 0,
    angleDir: 1,
    powerMilli: 0,
    powerDir: 1,
    ball: { xMilli: 0, yMilli: 0, vxMilli: 0, vyMilli: 0 },
    flightBeat: world.beat,
    drops: 0,
    dropBeat: -1,
    dropXMilli: 0,
    catchBeat: -1,
    hitTick: -1,
    hitXMilli: 0,
    hitYMilli: 0,
    hitRun: 0,
    slack: false,
    nudges: 0,
    tilted: false,
  };
  loadBoard(state);
  return state;
}

/** The round being played. Clamped, so a state read after the last one answers. */
export function pinballCurrent(state: PinballState): PinballRound {
  const round = state.rounds[Math.min(state.round, state.rounds.length - 1)];
  if (round === undefined) throw new Error("a pinball round with no rounds left to play");
  return round;
}

/** The current round's board onto the table, everything standing. */
export function loadBoard(state: PinballState): void {
  const round = pinballCurrent(state);
  state.pieces = round.pieces.map((p) => ({ ...p }));
  state.alive = state.pieces.map(() => true);
  state.lit = [];
}

/** Targets still standing. Zero is the round passed. */
export function pinTargetsLeft(state: PinballState): number {
  let left = 0;
  for (let i = 0; i < state.pieces.length; i++) {
    if (state.alive[i] === true && state.pieces[i]?.target === true) left += 1;
  }
  return left;
}
