import {
  BATON_SOCKET_LIT,
  type BatonBead,
  type BatonState,
  batonBaseCol,
  batonLead,
} from "./baton.js";
import { batonAcross, batonArms } from "./baton-level.js";
import type { SimConfig } from "./config.js";
import { clampCol } from "./config-derived.js";

/**
 * **THE BATON's arms, when there are two, and the arm across** — the `pair`
 * and `across` levels (`baton-level.ts`): where each hangs, where its sockets
 * sit in the one list of them, and which way a flight takes it.
 *
 * The state is not doubled. `BatonState.sockets` holds the first arm's sockets
 * and then the second's, and every bead says which arm it is on
 * (`BatonBead.arm`); a bead's `socket` is still counted down its own arm, so
 * every rule that asks *is this the last socket* asks it unchanged. Only the
 * few places that touch a socket's entry turn the pair into one index, here.
 */

/**
 * The column arm `arm` hangs in: dead centre when it is the only one, and
 * with two, a column either side of the centre — beside each other, with one
 * clear column between them for a swing to lean into without the two arms
 * ever meeting (`batonSwingCol`).
 */
export function batonArmCol(cfg: SimConfig, arms: number, arm: number): number {
  if (arms < 2) return batonBaseCol(cfg);
  return clampCol(cfg, batonBaseCol(cfg) + (arm === 0 ? -1 : 1));
}

/**
 * The column a socket of the arm across is in: a socket a column, left to
 * right, centred on the field — on eleven columns, the first socket in the
 * first column and the last in the last.
 */
export function batonAcrossCol(cfg: SimConfig, socket: number): number {
  return clampCol(cfg, batonBaseCol(cfg) - Math.floor((cfg.batonSockets - 1) / 2) + socket);
}

/** Where socket `socket` of arm `arm` is in `BatonState.sockets`. */
export function batonSlot(cfg: SimConfig, arm: number, socket: number): number {
  return arm * cfg.batonSockets + socket;
}

/** Where the socket a bead is in, or is flying out of, is in `BatonState.sockets`. */
export function batonBeadSlot(cfg: SimConfig, bead: BatonBead): number {
  return batonSlot(cfg, bead.arm, bead.socket);
}

/** The arm an entry of `BatonState.sockets` belongs to. */
export function batonSlotArm(cfg: SimConfig, slot: number): number {
  return Math.floor(slot / cfg.batonSockets);
}

/** The socket an entry of `BatonState.sockets` is, counted down its own arm. */
export function batonSlotSocket(cfg: SimConfig, slot: number): number {
  return slot % cfg.batonSockets;
}

/** Dark and shed sockets on one arm: how far down that arm the pair has got. */
export function batonArmDark(cfg: SimConfig, b: BatonState, arm: number): number {
  let dark = 0;
  for (let i = 0; i < cfg.batonSockets; i++)
    if ((b.sockets[batonSlot(cfg, arm, i)] ?? BATON_SOCKET_LIT) !== BATON_SOCKET_LIT) dark += 1;
  return dark;
}

/**
 * The column a flight launched now lands in. Along the arm across, the next
 * socket's. Down a hanging arm, only the lead bead of its own
 * arm swings it, and only once `batonSwingAfter` of that arm's sockets are
 * dark: right, back, left, back, from the first swung flight on, so the first
 * one *is* a swing and the pair meets it the beat the arm starts moving.
 * Counted in dark sockets rather than handovers, so a second bead's turns in
 * between do not skip the arm a step.
 *
 * **Two arms swing outward only** — out, back, out, back — so the clear
 * column between them stays clear, and a bolt meant for one bead never finds
 * the other arm's in its column.
 */
export function batonSwingCol(cfg: SimConfig, b: BatonState, bead: BatonBead): number {
  // Along the arm across every flight is a column to the right; it never swings.
  if (batonAcross(b)) return batonAcrossCol(cfg, bead.socket + 1);
  const dark = batonArmDark(cfg, b, bead.arm);
  if (bead !== batonLead(b, bead.arm) || dark < cfg.batonSwingAfter) return bead.fromCol;
  const arms = batonArms(b);
  const out = bead.arm === 0 ? -1 : 1;
  const steps = arms < 2 ? [1, 0, -1, 0] : [out, 0, out, 0];
  const swing = steps[(dark - cfg.batonSwingAfter) % 4] ?? 0;
  return clampCol(cfg, batonArmCol(cfg, arms, bead.arm) + swing);
}

/**
 * The column a socket hangs in, on any arm — the one reading the picture
 * needs for every entry of `BatonState.sockets`. Down an arm with a bead on it
 * it bends where `batonSocketCol` says; an arm whose bead was drawn into the
 * other's hangs straight in its own column; and with no bead left at all the
 * arm hangs where the last one dropped.
 */
export function batonSlotCol(cfg: SimConfig, b: BatonState, slot: number): number {
  if (batonAcross(b)) return batonAcrossCol(cfg, batonSlotSocket(cfg, slot));
  const arm = batonSlotArm(cfg, slot);
  const lead = batonLead(b, arm);
  if (lead === null) return b.beads.length === 0 ? b.col : batonArmCol(cfg, batonArms(b), arm);
  return slot % cfg.batonSockets <= lead.socket ? lead.fromCol : lead.col;
}
