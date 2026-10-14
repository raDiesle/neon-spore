import type { HydraHead } from "./hydra.js";

/**
 * What THE HYDRA says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. A seat is `seat`, nought the pilot; a piece is `piece`, its index in
 * the lit level's own order.
 */

interface HydraColEvent {
  /** The column it happened over. */
  col: number;
}

export type HydraEvent =
  /** The hydra comes in over the field. */
  | ({ type: "hydraEnter" } & HydraColEvent)
  /** A level's heads come for the ship: which kind. */
  | ({ type: "hydraHeads"; head: HydraHead } & HydraColEvent)
  /** A neck swiped across far enough is cut; `seat` cut it. */
  | ({ type: "hydraCut"; seat: 0 | 1; piece: number } & HydraColEvent)
  /** A swipe let go short of cutting: the neck swings on. */
  | ({ type: "hydraGlance"; seat: 0 | 1; piece: number } & HydraColEvent)
  /** A coil turned round another lap the way it unwinds; `laps` its whole laps so far. */
  | ({ type: "hydraLap"; seat: 0 | 1; laps: number } & HydraColEvent)
  /** A coil unwound its last lap and falls off the hull. */
  | ({ type: "hydraUncoil"; seat: 0 | 1; piece: number } & HydraColEvent)
  /** A side's eye opens. */
  | ({ type: "hydraOpen"; seat: 0 | 1; piece: number } & HydraColEvent)
  /** A side's eye blinks shut, untapped; it opens again. */
  | ({ type: "hydraBlink"; seat: 0 | 1; piece: number } & HydraColEvent)
  /** An open eye tapped shut for good. */
  | ({ type: "hydraPoke"; seat: 0 | 1; piece: number } & HydraColEvent)
  /** A tap on an eye that was shut: refused. */
  | ({ type: "hydraMiss"; seat: 0 | 1 } & HydraColEvent)
  /** A maw opens with fire in it. */
  | ({ type: "hydraMaw"; piece: number } & HydraColEvent)
  /** A bolt in the fire's colour went into the open maw: the head is down. */
  | ({ type: "hydraQuench"; piece: number } & HydraColEvent)
  /** A thumb went down on the partner's head, and took hold of nothing. */
  | ({ type: "hydraWrong"; seat: 0 | 1 } & HydraColEvent)
  /** The lit level's last head is stopped: the body rears back. */
  | ({ type: "hydraCleared"; head: HydraHead } & HydraColEvent)
  /** A level's time ran out: a head still coming strikes the hull. */
  | ({ type: "hydraStrike"; head: HydraHead; piece: number } & HydraColEvent)
  /** The last head is stopped: the hydra is beaten. */
  | ({ type: "hydraSpent" } & HydraColEvent)
  /** The hydra is gone; the wave may end. */
  | ({ type: "hydraOut" } & HydraColEvent);
