import {
  broodBoss,
  broodHangs,
  broodRipeIn,
  type Color,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import { fieldHand } from "./autopilot-field-hand.js";
import type { Hand } from "./hand.js";

/**
 * **THE BROOD played right**, for the autopilot: the bud nearest to dropping
 * first, the cannon under it, and a bolt of its colour once nothing of the
 * pair's is still on its way up (`sim/brood-step.ts`).
 *
 * **A body that has dropped comes first**, the field's way (`fieldHand`): it
 * is falling at the hull, and a bolt up its column would meet it before the
 * bud above it anyway.
 */
type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire = (color: Color): Press => ({ player: 2, command: { kind: "fire", color } });

export const broodHand: Hand = (w: World) => {
  const s = broodBoss(w);
  if (s === null) return [];
  if (w.creatures.length > 0 || s.phase !== "grow") return fieldHand(w);
  const hanging = s.buds.filter((b) => broodHangs(w, b));
  hanging.sort((a, b) => broodRipeIn(w, s, a) - broodRipeIn(w, s, b) || a.col - b.col);
  const bud = hanging[0];
  if (bud === undefined) return [];
  if (w.cannonCol !== bud.col) return [aim(bud.col)];
  return w.bullets.length === 0 ? [fire(bud.color)] : [];
};
