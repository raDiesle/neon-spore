import { CURTAIN_PHASES, type CurtainState } from "./curtain.js";

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
 *
 * `liftMilli` is here because how far the hem has come decides whether the core can be shot at all (`curtainHemHigh`), so two
 * devices holding different depths is two devices disagreeing about whether
 * a hit landed. The phase goes in as its index in `CURTAIN_PHASES`, which is
 * the whole reason that list is ordered and exported.
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
    CURTAIN_PHASES.indexOf(c.phase),
    c.phaseBeat,
    c.liftMilli,
    c.lobes.length,
    c.soft.length,
  ];
  for (const up of c.lobes) out.push(up ? 1 : 0);
  for (const i of c.soft) out.push(i);
  return out;
}
