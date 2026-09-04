import { caromImpactDamage } from "./carom.js";
import type { SimConfig } from "./config.js";
import { ghostImpactDamage } from "./ghost.js";
import type { Creature } from "./types.js";

/**
 * **What one body costs the hull when it reaches it**, for everything the
 * shield was never offered — which is every kind but a rock.
 *
 * It was one line inside `resolveHull` while `damageCreature` was the whole
 * answer, and then `ghostImpactDamage` when a charging ghost became the one
 * arrival that had *aimed* at the ship. THE CAROM is the second exception and
 * that is what makes this a file: two branches written into `hull.ts` would be
 * a switch over creature kinds living in the file that resolves the hull, and
 * the third one would be written there by pattern rather than by argument.
 *
 * Every exception is a rule owned by its own creature's file and called from
 * here, so what `hull.ts` asks is one question with one answer. `purity.test.ts`
 * is where "called, not re-derived" stops being a matter of good intentions;
 * this is the shape that keeps it callable.
 */
export function impactDamage(cfg: SimConfig, c: Creature): number {
  // A carom nobody cracked open. It arrives as the rock it always was and
  // costs what a rock costs, because the shield was never able to turn it.
  if (c.kind === "carom") return caromImpactDamage(cfg);
  // A charging ghost, head first. The one arrival that aimed itself at the
  // ship, and the only branch here that is about intent rather than material.
  return ghostImpactDamage(cfg, c);
}
