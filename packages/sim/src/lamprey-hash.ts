import { LAMPREY_ASKS, LAMPREY_PHASES, type LampreyState } from "./lamprey.js";

/**
 * What THE LAMPREY puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The tiles, the teeth and the bitten tiles go in
 * because they are the simulation's own and decide what a thumb lands on; the
 * thumbs because they are heard on the tick — each array with its length
 * ahead of it, THE CAPSTAN's way (`capstan-hash.ts`).
 */
export function lampreyHashParts(s: LampreyState): number[] {
  const out = [
    LAMPREY_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.col,
    s.row,
    s.fromCol,
    s.fromRow,
    s.nextCol,
    s.nextRow,
    s.teethOut,
    s.litTooth,
    s.pulled.length,
    ...s.pulled,
    s.hits,
    s.bitten.length,
    ...s.bitten,
    s.tailDown.length,
    ...s.tailDown.map((d) => (d ? 1 : 0)),
    s.tailMilli.length,
    ...s.tailMilli,
    s.headMilli.length,
    ...s.headMilli,
    s.tapDown.length,
    ...s.tapDown.map((d) => (d ? 1 : 0)),
    s.slipped.length,
    ...s.slipped.map((d) => (d ? 1 : 0)),
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(LAMPREY_ASKS.indexOf(step.ask) + 1);
    out.push(step.holder);
    out.push(step.teeth);
    out.push(step.jump);
    out.push(step.beats);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
  }
  return out;
}
