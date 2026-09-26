import { KEEL_PHASES, type KeelState } from "./keel.js";

/**
 * What THE KEEL puts into `hashWorld`, and nothing else.
 *
 * **The authored order goes in whole**, the way THE MANTLE's thresholds do
 * (`mantle-hash.ts`): copied onto the state at install, so two devices hung
 * different runs would light different joints. Each list's length goes in
 * ahead of it — the two pairs' as well, as THE MANTLE's — so two states differing only in how long one is cannot fold
 * into the same number. The socket's colour is 1 for red and 2 for cyan.
 */
export function keelHashParts(s: KeelState): number[] {
  const out = [
    s.socket === "red" ? 1 : 2,
    KEEL_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.movement,
    s.joint,
    s.repriseCursor,
    s.rockCol,
    s.rockBeat,
    s.held.length,
    s.held[0] ? 1 : 0,
    s.held[1] ? 1 : 0,
    s.chordBeats,
    s.marrow.length,
    s.marrow[0] ? 1 : 0,
    s.marrow[1] ? 1 : 0,
    s.flares,
    s.locked.length,
  ];
  for (const l of s.locked) out.push(l ? 1 : 0);
  out.push(s.reprise.length);
  for (const i of s.reprise) out.push(i);
  return out;
}
