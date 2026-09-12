import type { SimConfig } from "./config.js";
import { ghostIsCharging } from "./ghost.js";
import type { BreachWeight } from "./hull-damage.js";
import type { Creature } from "./types.js";

/**
 * **How one body sounds when it reaches the hull**, for everything the shield
 * was never offered — which is every kind but a rock.
 *
 * It was one line inside `resolveHull` while every arrival cost the same, then
 * a ghost's own rule when a charging ghost became the one arrival that had
 * *aimed* at the ship, then a carom's, a crystal's and a coil's — a `damage*`
 * figure each, argued against `damageCreature`. There are no points since 12
 * September 2026 (`hull-damage.ts`); what is left of the argument is the ear's
 * half of it, and it is one question with one answer, asked from `hull.ts`.
 */
export function impactWeight(cfg: SimConfig, c: Creature): BreachWeight {
  // A carom nobody cracked open, a crystal nobody broke, a coil whose dome
  // nobody opened: each arrives as the rock it always was, and the shield was
  // never able to turn it.
  if (c.kind === "carom" || c.kind === "crystal" || c.kind === "coil") return "heavy";
  // A charging ghost, head first. The one arrival that aimed itself at the
  // ship, and the only branch here that is about intent rather than material.
  return ghostIsCharging(cfg, c) ? "heavy" : "light";
}
