import {
  instarActing,
  instarMarkCol,
  instarMarkDone,
  instarPanel,
  instarStep,
  sceneBoss,
  type TimedCommand,
} from "@neon-spore/sim";
import { sceneThumbs } from "./boss-hands-handles.js";
import type { Hand } from "./hand.js";

type Press = Omit<TimedCommand, "tick">;

/**
 * **A scene's hands**, THE NETTLE's and THE INSTAR's: the thumbs and the panel.
 * The thumbs on the body are `sceneThumbs` (`boss-hands-handles.ts`), and the
 * SHOOT, SHIELD and SUCK marks are the panel played straight — the first undone one, the cannon or the shield
 * slid under it, and the press (`sim/scene-panel.ts`). Both at once, so a
 * step with a tap on the body and a spore at the hull is answered the way a
 * pair answers it: one seat on each.
 *
 * It presses every tick it stands under the mark. The cannon refuses a shot
 * inside its cooldown and a bolt already climbing still counts when it goes
 * out, so a press too many is a bolt into the sky, which the scene takes.
 * THE INSTAR has had panel marks since its second act (26 September 2026).
 */
export const nettleHand: Hand = (w) => [...sceneThumbs(w), ...panelPresses(w)];
export const instarHand: Hand = nettleHand;

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
