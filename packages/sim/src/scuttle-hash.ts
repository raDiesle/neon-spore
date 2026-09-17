import type { ScuttlePartKind, ScuttleState } from "./scuttle.js";

/**
 * What THE SCUTTLE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `lead-hash.ts` is one: `hash-boss-clocks.ts`
 * grows by a whole boss at a time.
 *
 * **The sockets are the fields that matter most**: which parts are still in
 * the frame, and what each will be thrown as, are facts the seed decided
 * once and both devices must hold identically, or one phone would throw a
 * rock where the other threw a pod. An empty socket is a code of its own
 * rather than a skipped entry, so two frames that differ only in which
 * socket is empty cannot fold into the same number; the loose list goes in
 * with its length ahead of it for the same reason.
 */
export function scuttleHashParts(s: ScuttleState): number[] {
  const out = [
    s.parts.length,
    s.live,
    s.lastLive,
    s.cycleBeat,
    s.slack,
    s.windBeat,
    s.downBeat,
    s.loose.length,
  ];
  for (const p of s.parts)
    out.push(p === null ? 0 : partCode(p.kind) * 2 + (p.color === "red" ? 1 : 2));
  for (const i of s.loose) out.push(i);
  return out;
}

/** A part's kind as a number the fingerprint can hold: never nought, which is the empty socket's. */
function partCode(kind: ScuttlePartKind): number {
  return kind === "rock" ? 1 : kind === "body" ? 2 : 3;
}
