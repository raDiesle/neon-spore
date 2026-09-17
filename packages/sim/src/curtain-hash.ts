import type { CurtainState } from "./curtain.js";

/**
 * What THE CURTAIN puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `gorge-hash.ts` is one: `hash-boss.ts` grows
 * by a whole boss at a time.
 *
 * **The lobes and the soft set are the fields that matter most**: two
 * devices disagreeing about which lobe is soft would have player 1 calling a
 * shot that takes nothing off on the other phone. The fabric's own column is
 * not here because it is the body's, and the creature walk already has it.
 */
export function curtainHashParts(c: CurtainState): number[] {
  const out = [
    c.creatureId,
    c.coreCol,
    c.coreColor === "red" ? 1 : 2,
    c.coreHits,
    c.softBeat,
    c.fireBeat,
    c.moveBeat,
    c.tornBeat,
    c.outBeat,
    c.lobes.length,
    c.soft.length,
  ];
  for (const up of c.lobes) out.push(up ? 1 : 0);
  for (const i of c.soft) out.push(i);
  return out;
}
