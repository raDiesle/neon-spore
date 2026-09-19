import type { LedgerState } from "./ledger.js";

/**
 * What THE LEDGER puts into `hashWorld`, and nothing else.
 *
 * Its own file for `taster-hash.ts`' reason: `hash-boss.ts` grows by a whole
 * boss at a time.
 *
 * **The beads matter most.** Two devices that disagreed about when a return
 * lands would have one screen warding an empty socket and the other taking the
 * hit that ends the wave, which is the loudest desync any boss in this game can
 * have — so every bead's landing beat, its span and whether it is the last one
 * are all in. The socket and the walk are in for the same reason said about
 * space rather than time. The phase is not here because it is not kept: it is
 * read off the seam, the root beat and the out beat, which are.
 */
export function ledgerHashParts(t: LedgerState): number[] {
  const out = [
    t.col,
    t.socket,
    t.walk,
    t.want === "red" ? 1 : 2,
    t.seam,
    t.warded,
    t.rootBeat,
    t.outBeat,
    t.beads.length,
    // The four hands, which move the same three things the clock does — where
    // the cord is rooted, when a return lands, and whether the fight is over —
    // so a device that missed one would be a device disagreeing about all of it.
    t.foot,
    t.plug ? 1 : 0,
    t.plugBeats,
    t.rolled,
    t.haulMilli,
  ];
  for (const b of t.beads) out.push(b.beat, b.span, b.last ? 1 : 0, b.pulled ? 1 : 0);
  return out;
}
