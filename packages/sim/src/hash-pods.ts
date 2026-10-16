import { POD_KINDS, type Pod } from "./types.js";

/**
 * The pods on the field, folded into the world hash.
 *
 * `hash-faults.ts`'s file one mechanic along, and split for exactly its
 * reason: `hash.ts` was back at its 250-line ceiling, and the field that
 * pushed it over was THE HUSK's — a pod that is a lie wearing a real one's face
 * (`pod-types.ts`). The next thing a pod carries is a line here rather than a
 * line in the middle of the world's own fields.
 *
 * A list of numbers rather than a `push` handed in, the way `bossHashParts`
 * and `faultHashParts` both answer one: the caller folds them in its own
 * order, and this file cannot come to depend on where in the hash it was
 * called.
 */
export function podHashParts(pods: readonly Pod[]): number[] {
  const out: number[] = [pods.length];
  for (const p of pods) {
    out.push(p.id, p.colMilli, p.rowMilli, p.driftMilli, p.loose ? 1 : 0);
    // Real or hollow. A husk is taken in on the same two conditions a pod is
    // and pays the opposite way, so two devices that disagree here disagree
    // about whether the wave has just been lost.
    out.push(POD_KINDS.indexOf(p.kind) + 1);
    // And its clock. Two devices a tick apart here lose the wave a tick apart.
    out.push(p.dueTicks);
    // How it crosses. A device that disagrees here is watching a power-up in a
    // different column from the one the other device has the arm over.
    out.push(p.crossMilli);
    // Strung or not. A device that disagrees here frees one pod where the
    // other frees three.
    out.push(p.roe ? 1 : 0);
  }
  return out;
}
