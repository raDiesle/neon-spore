import {
  instarActing,
  instarMarkCol,
  instarMarkDone,
  instarPanel,
  instarStep,
  type SceneMark,
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
 * It presses every tick it stands under the mark until the bolts climbing in
 * that column are all the mark still needs, then goes on to the next one
 * (`covered`). The cannon refuses a shot inside its cooldown, and a bolt
 * already climbing still counts when it goes out.
 * THE INSTAR has had panel marks since its second act (26 September 2026).
 */
export const nettleHand: Hand = (w) => [...sceneThumbs(w), ...panelPresses(w)];
export const instarHand: Hand = nettleHand;

function panelPresses(w: Parameters<Hand>[0]): Press[] {
  const s = sceneBoss(w);
  if (s === null || !instarActing(s)) return [];
  const marks = instarStep(s)?.marks ?? [];
  const i = marks.findIndex(
    (m, j) => instarPanel(m.gesture) && !instarMarkDone(s, j) && !covered(w, m, s.progress[j] ?? 0),
  );
  const mark = marks[i];
  if (mark === undefined) return [];
  const col = instarMarkCol(w.cfg, mark);
  if (mark.gesture === "shield") {
    if (w.shieldCol !== col) return [{ player: 2, command: { kind: "shieldCol", col } }];
    return [{ player: 1, command: { kind: "guard" } }];
  }
  if (w.cannonCol !== col) return [{ player: 1, command: { kind: "cannonCol", col } }];
  if (mark.gesture === "suck") return [{ player: 1, command: { kind: "intake" } }];
  // In the mark's colour: a bolt of the other one is refused (`sim/scene-panel.ts`).
  return [{ player: 2, command: { kind: "fire", color: mark.color ?? "red" } }];
}

/**
 * A SHOOT mark whose remaining count is already climbing up its column. The
 * hand moves on to the next mark rather than pressing more: a press sent every
 * tick is still on the wire when the cannon slides away, and it would land
 * under the next mark, which in the other colour refuses it. Moving on while
 * the bolts climb is also the only way two marks of two bolts each fit one
 * window.
 */
function covered(w: Parameters<Hand>[0], mark: SceneMark, progress: number): boolean {
  if (mark.gesture !== "shoot") return false;
  const col = instarMarkCol(w.cfg, mark);
  const color = mark.color ?? "red";
  const climbing = w.bullets.filter((b) => b.col === col && b.color === color).length;
  return progress + climbing >= mark.need;
}
