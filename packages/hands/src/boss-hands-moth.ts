import {
  type MothState,
  mothBoss,
  mothLitSpots,
  type TimedCommand,
  type World,
} from "@neon-spore/sim";
import { fieldHand } from "./autopilot-field-hand.js";
import type { Hand } from "./hand.js";

/**
 * **THE MOTH played right**, for the autopilot (`sim/moth.ts`): on a wings
 * step, the cannon under the lit spot nearest it and a red bolt the moment it
 * stands there, before the moth turns to it; on the belly step, the cannon
 * under the moth to bring it down, and a red bolt once its belly opens.
 *
 * **A slick it has shed comes first**, the field's way (`fieldHand`): it is
 * falling at the hull, and a bolt up its column would meet it before the wing
 * above it anyway.
 */
type Press = Omit<TimedCommand, "tick">;

const aim = (col: number): Press => ({ player: 1, command: { kind: "cannonCol", col } });
const fire: Press = { player: 2, command: { kind: "fire", color: "red" } };

/** The column the cannon should stand in now, or -1 when nothing is asked. */
function mothTarget(w: World, s: MothState): number {
  const step = s.steps[s.cursor];
  if (s.phase !== "flit" || step === undefined) return -1;
  if (step.kind === "belly") return s.centre;
  const cols = mothLitSpots(s).map((o) => s.centre + o);
  cols.sort((a, b) => Math.abs(a - w.cannonCol) - Math.abs(b - w.cannonCol) || a - b);
  return cols[0] ?? -1;
}

export const mothHand: Hand = (w: World) => {
  const s = mothBoss(w);
  if (s === null) return [];
  if (w.creatures.length > 0) return fieldHand(w);
  const col = mothTarget(w, s);
  if (col < 0) return [];
  if (w.cannonCol !== col) return [aim(col)];
  const belly = s.steps[s.cursor]?.kind === "belly";
  if (belly && s.settle === 0) return [];
  return w.bullets.length === 0 ? [fire] : [];
};
