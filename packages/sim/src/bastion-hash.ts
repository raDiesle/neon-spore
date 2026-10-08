import { BASTION_LAYERS, BASTION_PHASES, type BastionState } from "./bastion.js";

/**
 * What THE BASTION puts into `hashWorld`, and nothing else.
 *
 * **The authored script goes in whole**, THE SEAM's reason (`seam-hash.ts`),
 * each shell's colours and columns with their lengths ahead of them. The
 * pieces off go in because they are the fight; each seat's thumb, its pull
 * and whether its plate tore under it because a lift is judged on them; the
 * turn of the moon and the rim's thumb because the gun a shot meets is read
 * off them; and the node's charge because the shield is judged against it.
 */
export function bastionHashParts(s: BastionState): number[] {
  const out = [
    BASTION_PHASES.indexOf(s.phase) + 1,
    s.phaseBeat,
    s.cursor,
    s.goneMask,
    s.pieces,
    s.down.length,
    ...s.down.map((d) => (d ? 1 : 0)),
    s.pullMilli.length,
    ...s.pullMilli,
    s.tore.length,
    ...s.tore.map((t) => (t ? 1 : 0)),
    s.yawMilli,
    s.spinning ? 1 : 0,
    s.spinAtMilli,
    s.dischargeBeat,
    s.chargeTick,
    s.nextChargeBeat,
    s.steps.length,
  ];
  for (const step of s.steps) {
    out.push(BASTION_LAYERS.indexOf(step.layer) + 1);
    out.push(step.beats);
    const colors = step.colors ?? [];
    out.push(colors.length);
    for (const c of colors) out.push(c === "red" ? 1 : 2);
    const offsets = step.offsets ?? [];
    out.push(offsets.length);
    for (const o of offsets) out.push(o);
  }
  return out;
}
