import { TRAPEZE_ASKS, TRAPEZE_PHASES, type TrapezeState } from "./trapeze.js";

/**
 * What THE TRAPEZE puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * with its length ahead of it. The swing goes in because it is the
 * simulation's own and decides whether a swipe pushes or brakes and where a
 * bolt meets the alien; the half swings and the last pushed, the callers, the
 * fingers down and the lock because they are heard on the tick — each seat's
 * pair with its length ahead of it, THE CAPSTAN's way (`capstan-hash.ts`).
 */
export function trapezeHashParts(s: TrapezeState): number[] {
  const out = [
    TRAPEZE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.ampMilli,
    s.swingTick,
    s.half,
    s.pushedHalf,
    s.callers.length,
    ...s.callers,
    s.down.length,
    ...s.down,
    s.lockBeats,
    s.gongs,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(TRAPEZE_ASKS.indexOf(step.ask) + 1);
    out.push(step.gongSide);
    out.push(step.gongMilli);
    out.push(step.beats);
  }
  return out;
}
