import { type BatonBead, type BatonState, batonLead, batonSocketRow } from "./baton.js";
import { batonAcrossCol } from "./baton-arm.js";
import { batonAcross } from "./baton-level.js";
import { beatStartTick } from "./beat-clock.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import { MILLI } from "./world.js";

/**
 * Where a bead of THE BATON is on a tick, and which bead the trigger is for —
 * the row and the column a bolt has to meet it at and the picture draws it at,
 * and the reading that ranks two beads against one press. Split off `baton.ts`
 * when the second bead arrived and that file went over its limit, and the two
 * readings at the foot came the same way when the arm was given a thumb of its
 * own (`baton-hand.ts`); every answer here is a pure function of the state and
 * the tick, so two devices asking on the same tick get the same bead in the
 * same place.
 */

/**
 * The tick a bead's flight lands on: `batonFlightBeats` whole beats from the
 * top of the beat the launch was in — `batonFinalBeats` on the crossing.
 * Counted from the beat's start rather than from the press, so a bead
 * launched late in a beat still lands on a beat — the landing is a thing the
 * pair counts to.
 */
export function batonLandTick(cfg: SimConfig, bead: BatonBead): number {
  const beats = bead.final ? cfg.batonFinalBeats : cfg.batonFlightBeats;
  return beatStartTick(cfg, bead.flightTick) + beats * ticksPerBeat(cfg);
}

/**
 * How far along its arm a bead is on this tick, in thousandths of a socket
 * from the first: its socket's place, sitting; flying, between the socket it
 * left and the next, by how much of the flight has passed — a straight line,
 * because a bead that eased would be a bead whose position on a given tick
 * the two seats could not both count out loud. On an arm hanging down a
 * column this is its row; where a knocked bead was thrown from is kept in
 * the same measure (`BatonBead.backFromMilli`).
 */
export function batonBeadAlongMilli(cfg: SimConfig, bead: BatonBead, tick: number): number {
  const from = bead.socket * MILLI;
  if (!bead.flying) return from;
  const land = batonLandTick(cfg, bead);
  const span = Math.max(1, land - bead.flightTick);
  const gone = Math.min(span, Math.max(0, tick - bead.flightTick));
  return from + Math.round((gone * MILLI) / span);
}

/**
 * Where a bead is, in thousandths of a row down from the top, on this tick —
 * the row a bolt has to meet it on. Down a hanging arm, how far along it the
 * bead is. Along the arm across it stays on the arm's row, flight and all,
 * except the crossing's, which drops out of the last socket the way the
 * hanging arm's does: a row in `batonFinalBeats`.
 */
export function batonBeadRowMilli(
  cfg: SimConfig,
  b: BatonState,
  bead: BatonBead,
  tick: number,
): number {
  const along = batonBeadAlongMilli(cfg, bead, tick);
  if (!batonAcross(b)) return along;
  const row = batonSocketRow(cfg, b, bead.socket) * MILLI;
  return bead.final ? row + along - bead.socket * MILLI : row;
}

/**
 * The column a socket of `arm` hangs in. The arm bends at its lead bead:
 * sockets above its socket are where it left from and the rest are where it
 * is landing, so a swing is a lean in the arm and not a jump — and a bead
 * higher up rides the arm wherever the lead has taken it. With no bead left
 * the arm hangs where the last one dropped. Along the arm across, a socket a
 * column (`batonAcrossCol`). Asked for the arm of a bead in hand; for any
 * entry of the sockets, on either arm, `batonSlotCol`.
 */
export function batonSocketCol(cfg: SimConfig, b: BatonState, socket: number, arm = 0): number {
  if (batonAcross(b)) return batonAcrossCol(cfg, socket);
  const lead = batonLead(b, arm);
  if (lead === null) return b.col;
  return socket <= lead.socket ? lead.fromCol : lead.col;
}

/**
 * The column a bead is over on this tick: its socket's, sitting; flying,
 * `fromCol` for the first half of the flight and `col` after.
 */
export function batonBeadCol(cfg: SimConfig, b: BatonState, bead: BatonBead, tick: number): number {
  if (!bead.flying) return batonSocketCol(cfg, b, bead.socket, bead.arm);
  if (bead.fromCol === bead.col) return bead.col;
  const land = batonLandTick(cfg, bead);
  return tick - bead.flightTick < (land - bead.flightTick) / 2 ? bead.fromCol : bead.col;
}

/**
 * A bead in the last socket with another still on the arm is **waiting**: it
 * cannot be launched, because out of that socket there is only the drop and
 * the drop is the merged bead's; and it does not settle, because the design
 * hangs it there *by a thread* until the other arrives
 * (`docs/spec/bosses-choreographed.md` §10, step 12).
 */
export function batonWaiting(cfg: SimConfig, b: BatonState, bead: BatonBead): boolean {
  return b.beads.length > 1 && !bead.flying && bead.socket === cfg.batonSockets - 1;
}

/**
 * The bead player 1's trigger sends: of the beads sitting and not waiting,
 * the one that has sat longest, and the lower one when two sat down on the
 * same beat. Longest-sitting, so two beads take turns under one trigger —
 * the lead goes, and while it is in the air the trigger's next press is the
 * other's — which is what puts two beads in the air at once for player 2
 * to tell apart. With one bead on the arm it is that bead or nothing.
 */
export function batonLaunchable(cfg: SimConfig, b: BatonState): BatonBead | null {
  let pick: BatonBead | null = null;
  for (const bead of b.beads) {
    if (bead.flying || batonWaiting(cfg, b, bead)) continue;
    if (pick === null || bead.satBeat < pick.satBeat) pick = bead;
    else if (bead.satBeat === pick.satBeat && bead.socket > pick.socket) pick = bead;
  }
  return pick;
}
