import { beatStartTick } from "./beat-clock.js";
import { midCol, type SimConfig, ticksPerBeat } from "./config.js";
import type { Color } from "./types.js";
import { MILLI } from "./world.js";

/**
 * THE BATON: whose turn is it.
 *
 * **The question no other boss asks** — *whether the two of you can take
 * turns without either of you deciding whose turn it is.* One arm of sockets
 * hangs down the middle of the field with a bead in the topmost. Player 1
 * launches the bead (the guard press, which is the one verb that seat has
 * with nothing under it while the arm stands); it crosses to the next socket
 * down over three real beats — **THE DRAG, not THE SLOW**: the field does not
 * slow, the bead is simply in the air for a long time
 * (`docs/spec/bosses-choreographed.md` §10) — and while it is in the air
 * player 2 has to put a shot of the bead's colour through it. A bead struck
 * lands and the socket it left goes dark; a bead not struck lands back where
 * it was; a bead that sits too long is shaken back to the base. **Whoever
 * acted is locked out for a beat** (`batonLocks`), so no seat can do both
 * halves — the turn is real because the rule takes the other half away.
 *
 * **It is a fixture and not a body** (`bossFillsWave`): the arm hangs in one
 * column and falls nothing, so the arrivals around it are the ones the wave's
 * own author wrote. The one thing it puts on the field by itself is a shed
 * shell (`batonShed`), and that is the DIASTOLE lane's exception spoken for:
 * the rock falls down the arm's own column, on the beat the pair's own
 * handovers reached the sixth dark socket, from the row of the socket that
 * went dark first — three numbers no author can write because the pair
 * decides all three during the fight.
 *
 * **Health is the arm.** Every socket the bead has left is dark, and the
 * last handover drops the bead out of the bottom of the arm as a loose pod:
 * the fight ends the way a pod does, in the maw, with player 1 under it.
 *
 * The clock, the launch and the landing are `baton-step.ts`, the fingerprint
 * is `baton-hash.ts`, the numbers are `config-baton.ts`. This file is the
 * shape, the geometry and the questions asked of both.
 */

/**
 * The stages, in the order `baton-hash.ts` numbers them by.
 *
 * A list rather than a bare union for `STARE_PHASES`' reason: a stage goes
 * into `hashWorld` as its index, so the order is a wire value.
 *
 * - `unfolding` — the arm unfolds downward, one socket a beat. Nothing to press yet.
 * - `sitting` — the bead is in a socket and player 1 may launch it.
 * - `flying` — the bead is in the air between two sockets, and player 2 may
 *   strike it.
 * - `falling` — the bead has dropped out of the last socket as a loose pod.
 * - `down` — the pod was taken. The arm folds away and the boss is spent.
 */
export const BATON_STAGES = ["unfolding", "sitting", "flying", "falling", "down"] as const;

/** Where the fight is. */
export type BatonStage = (typeof BATON_STAGES)[number];

/**
 * What a socket is. `lit` has not been passed yet, `dark` has, and `shed` is
 * a dark socket whose shell has already fallen off the arm (`batonShed`).
 */
export const BATON_SOCKET_LIT = 0;
export const BATON_SOCKET_DARK = 1;
export const BATON_SOCKET_SHED = 2;

/** Everything THE BATON remembers between beats. */
export interface BatonState {
  kind: "baton";
  stage: BatonStage;
  /** `world.beat` the current stage began on. */
  stageBeat: number;
  /** The column the arm hangs in — and the one the bead is landing in. */
  col: number;
  /** The column the bead left from. The same as `col` until the arm swings. */
  fromCol: number;
  /**
   * One entry per socket, base first: `BATON_SOCKET_LIT`, `_DARK` or
   * `_SHED`. The silhouette is the health bar.
   */
  sockets: number[];
  /** The socket the bead is in, or is flying out of. */
  socket: number;
  /** `world.tick` the flight began on, -1 while it is not in the air. */
  flightTick: number;
  /** Whether a shot of the right colour has gone through it this flight. */
  struck: boolean;
  /** The colour the bead carries, which is the colour that takes it. */
  color: Color;
  /** Sockets passed so far. Decides when the turn tightens and where the arm swings. */
  handovers: number;
  /** Times the arm shook a sitting bead back to the base. */
  settles: number;
  /**
   * The last `world.beat` each seat is locked out through, inclusive: index
   * 0 is player 1, index 1 player 2. -1 is never locked.
   */
  lockUntil: [number, number];
  /** The loose pod the bead became, or -1 before it fell. */
  podId: number;
  /** `world.beat` the arm last shed a shell on, -1 before the first. */
  shedBeat: number;
}

/** Where the arm hangs: dead centre, for THE VANE's and THE WARDEN's reason. */
export function batonBaseCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/**
 * The row a socket sits on: socket 0 is the top row and the arm hangs down
 * from it, one socket a row, so the bead is passed *down* the arm and the
 * last socket is the one nearest the hull — which is where it has to be for
 * the bead to drop out of it into the maw (`baton-step.ts`).
 */
export function batonSocketRow(_cfg: SimConfig, socket: number): number {
  return socket;
}

/** Dark and shed sockets together: how far up the arm the pair has got. */
export function batonDark(b: BatonState): number {
  let dark = 0;
  for (const s of b.sockets) if (s !== BATON_SOCKET_LIT) dark += 1;
  return dark;
}

/** Whether that seat may touch the ship on this beat. */
export function batonLocked(b: BatonState, player: 1 | 2, beat: number): boolean {
  return beat <= (player === 1 ? b.lockUntil[0] : b.lockUntil[1]);
}

/**
 * The tick a flight that began on `flightTick` lands on: `batonFlightBeats`
 * whole beats from the top of the beat the launch was in. Counted from the
 * beat's start rather than from the press, so a bead launched late in a beat
 * still lands on a beat — the landing is a thing the pair counts to.
 */
export function batonLandTick(cfg: SimConfig, flightTick: number): number {
  return beatStartTick(cfg, flightTick) + cfg.batonFlightBeats * ticksPerBeat(cfg);
}

/**
 * Where the bead is, in thousandths of a row down from the top, on this tick.
 *
 * Sitting, it is on its socket's row. Flying, it is between the socket it left
 * and the one below, by how much of the flight has passed — a straight line,
 * because a bead that eased would be a bead whose position on a given tick
 * the two seats could not both count out loud.
 */
export function batonBeadRowMilli(cfg: SimConfig, b: BatonState, tick: number): number {
  const from = batonSocketRow(cfg, b.socket) * MILLI;
  if (b.stage !== "flying") return from;
  const land = batonLandTick(cfg, b.flightTick);
  const span = Math.max(1, land - b.flightTick);
  const gone = Math.min(span, Math.max(0, tick - b.flightTick));
  return from + Math.round((gone * MILLI) / span);
}

/** The column the bead is over on this tick: `fromCol` for the first half of a flight, `col` after. */
export function batonBeadCol(cfg: SimConfig, b: BatonState, tick: number): number {
  if (b.stage !== "flying" || b.fromCol === b.col) return b.col;
  const land = batonLandTick(cfg, b.flightTick);
  return tick - b.flightTick < (land - b.flightTick) / 2 ? b.fromCol : b.col;
}

/** The other colour. A bead struck lands wearing the colour it was not. */
export function batonFlip(color: Color): Color {
  return color === "red" ? "cyan" : "red";
}
