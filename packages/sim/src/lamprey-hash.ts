import { LAMPREY_ASKS, LAMPREY_PHASES, type LampreyState } from "./lamprey.js";

/**
 * What THE LAMPREY puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The jaw, the bite's depth and the teeth go in
 * because they are the simulation's own and decide what a thumb lands on; the
 * thumbs because they are heard on the tick — each array with its length
 * ahead of it, THE CAPSTAN's way (`capstan-hash.ts`).
 */
export function lampreyHashParts(s: LampreyState): number[] {
  const out = [
    LAMPREY_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.jawCol,
    s.crawlDir,
    s.crawlBeat,
    s.biteMilli,
    s.teethOut,
    s.litTooth,
    s.toothBeat,
    s.pulled.length,
    ...s.pulled,
    s.rebiting ? 1 : 0,
    s.hits,
    s.holdCol.length,
    ...s.holdCol,
    s.tapDown.length,
    ...s.tapDown.map((d) => (d ? 1 : 0)),
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(LAMPREY_ASKS.indexOf(step.ask) + 1);
    out.push(step.pinner);
    out.push(step.teeth);
    out.push(step.toothBeats);
    out.push(step.col);
    out.push(step.crawl);
    out.push(step.crawlBeats);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
