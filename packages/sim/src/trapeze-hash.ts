import { TRAPEZE_ASKS, TRAPEZE_PHASES, type TrapezeState } from "./trapeze.js";

/**
 * What THE TRAPEZE puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The swing goes in because it is the
 * simulation's own and decides whether a tap lands, and the freeze, the
 * thumbs and the draws because they are heard on the tick and counted on the
 * beat — each seat's pair with its length ahead of it, THE CAPSTAN's way
 * (`capstan-hash.ts`).
 */
export function trapezeHashParts(s: TrapezeState): number[] {
  const out = [
    TRAPEZE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.swingMilli,
    s.swingDir,
    s.frozenBeats,
    s.frozenBy ?? -1,
    s.catches,
    s.hits,
    s.spindleLit ? 1 : 0,
    s.tapDown.length,
    ...s.tapDown.map((d) => (d ? 1 : 0)),
    s.holding.length,
    ...s.holding.map((h) => (h ? 1 : 0)),
    s.drawnBeats.length,
    ...s.drawnBeats,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(TRAPEZE_ASKS.indexOf(step.ask) + 1);
    out.push(step.freezer === "either" ? 3 : step.freezer);
    out.push(step.offset);
    out.push(step.sweepMilli);
    out.push(step.color === "red" ? 1 : step.color === "cyan" ? 2 : 3);
    out.push(step.beats);
  }
  return out;
}
