import { POD_KINDS, type Pod } from "./types.js";

/**
 * The pods on the field, folded into the world hash.
 *
 * `hash-faults.ts`'s file one mechanic along, and split for exactly its
 * reason: `hash.ts` was back at its 250-line ceiling, and the field that
 * pushed it over was THE HUSK's — a pod that is a lie wearing a cargo's face
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
    // What it gives when it is swallowed — `pods.ts` switches on it for hull,
    // for a swept field or for an armed shield, so two devices that disagree
    // here disagree about the state of the ship a beat later.
    out.push(POD_KINDS.indexOf(p.kind) + 1);
    // And whether the face it is wearing is a lie. A husk is taken in on the
    // same two conditions a pod is and pays the opposite way, so two devices
    // that disagree here disagree about whether the wave has just been lost.
    out.push(p.husk ? 1 : 0);
    // How it crosses. A device that disagrees here is watching a power-up in a
    // different column from the one the other device has the arm over.
    out.push(p.crossMilli);
  }
  return out;
}
