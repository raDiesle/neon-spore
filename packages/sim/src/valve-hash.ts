import { VALVE_PHASES, type ValveState } from "./valve.js";

/**
 * What THE VALVE puts into `hashWorld`, and nothing else.
 *
 * **The authored marks go in whole**, the way THE KEEL's order does
 * (`keel-hash.ts`): copied onto the state at install, so two devices hung
 * different marks would open different windows. The list's length goes in
 * ahead of it so two states differing only in how long it is cannot fold into
 * the same number.
 */
export function valveHashParts(s: ValveState): number[] {
  const out = [
    VALVE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.movement,
    s.pins,
    s.wheelMilli,
    s.handMilli,
    s.travelMilli,
    s.held.length,
    s.held[0] ? 1 : 0,
    s.held[1] ? 1 : 0,
    s.chordBeats,
    s.rubs.length,
    s.rubs[0] ?? 0,
    s.rubs[1] ?? 0,
    s.wiped,
    s.sparkCol,
    s.sparkBeat,
    s.marks.length,
  ];
  for (const m of s.marks) out.push(m);
  return out;
}
