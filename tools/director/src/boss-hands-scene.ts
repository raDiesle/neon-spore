import {
  instarActing,
  instarMarkCol,
  instarMarkDone,
  instarPanel,
  instarStep,
  sceneBoss,
  type TimedCommand,
} from "@neon-spore/sim";
import { instarHand } from "./boss-hands-handles.js";
import type { Hand } from "./poses-bosses-kit.js";

type Press = Omit<TimedCommand, "tick">;

/**
 * **THE NETTLE's hands**: the thumbs on its body are THE INSTAR's hand
 * (`boss-hands-handles.ts`), and its SHOOT, SHIELD and SUCK marks are the
 * panel played straight — the first undone one, the cannon or the shield
 * slid under it, and the press (`sim/scene-panel.ts`). Both at once, so a
 * step with a tap on the body and a spore at the hull is answered the way a
 * pair answers it: one seat on each.
 *
 * It presses every tick it stands under the mark. The cannon refuses a shot
 * inside its cooldown and a bolt already climbing still counts when it goes
 * out, so a press too many is a bolt into the sky, which THE NETTLE takes.
 */
export const nettleHand: Hand = (w) => [...instarHand(w), ...panelPresses(w)];

function panelPresses(w: Parameters<Hand>[0]): Press[] {
  const s = sceneBoss(w);
  if (s === null || !instarActing(s)) return [];
  const marks = instarStep(s)?.marks ?? [];
  const i = marks.findIndex((m, j) => instarPanel(m.gesture) && !instarMarkDone(s, j));
  const mark = marks[i];
  if (mark === undefined) return [];
  const col = instarMarkCol(w.cfg, mark);
  if (mark.gesture === "shield") {
    if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
    return [{ player: 1, command: { kind: "guard" } }];
  }
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  if (mark.gesture === "suck") return [{ player: 1, command: { kind: "intake" } }];
  return [{ player: 2, command: { kind: "fire", color: "red" } }];
}
