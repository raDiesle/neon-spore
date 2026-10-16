import { POD_KINDS } from "./pod-types.js";
import { SWINDLE_PHASES, type SwindleState } from "./swindle.js";

/**
 * What THE SWINDLE puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE HYDRA's reason (`hydra-hash.ts`):
 * each hand's pods with their kinds, its swaps and its drops, with their
 * lengths ahead of them. The pods hung go in by id because the receipt is
 * matched against them; the glide because the next beat stops it there; the
 * swaps and drops done because the next beat reads on from there.
 */
export function swindleHashParts(s: SwindleState): number[] {
  const out = [
    SWINDLE_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.hung.length,
    ...s.hung,
    s.swapped,
    s.dropped,
    s.glide.length,
    ...s.glide,
    s.glideTo.length,
    ...s.glideTo,
    s.glideEnd,
    s.taken,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(step.pods.length);
    for (const p of step.pods) out.push(p.offset, POD_KINDS.indexOf(p.kind) + 1);
    out.push(step.swaps.length);
    for (const w of step.swaps) out.push(w.at, w.a, w.b);
    out.push(step.drops.length);
    for (const d of step.drops) out.push(d.at, d.pod);
  }
  return out;
}
