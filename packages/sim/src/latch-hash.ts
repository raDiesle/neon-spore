import { LATCH_ASKS, LATCH_PHASES, type LatchState } from "./latch.js";

/**
 * What THE LATCH puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The tendril, the floor and the knots go in
 * because they are the fight; each seat's thumb, where it took hold and how
 * far it has pulled because a lift and a yank are judged on them, whose turn
 * it is because only that grip moves the rope — each
 * seat's pair with its length ahead of it, THE CAPSTAN's way
 * (`capstan-hash.ts`) — and the next yank because the rear is read off it.
 */
export function latchHashParts(s: LatchState): number[] {
  const out = [
    LATCH_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.hauledMilli,
    s.floorMilli,
    s.knots,
    s.levelKnots,
    s.down.length,
    ...s.down.map((d) => (d ? 1 : 0)),
    s.anchorMilli.length,
    ...s.anchorMilli,
    s.depthMilli.length,
    ...s.depthMilli,
    s.turn,
    s.yankBeat,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(LATCH_ASKS.indexOf(step.ask) + 1);
    out.push(step.knots);
    out.push(step.beats);
  }
  return out;
}
