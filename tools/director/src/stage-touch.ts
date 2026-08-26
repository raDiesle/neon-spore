import {
  type Field,
  type Hold,
  type Layout,
  touchDown,
  touchMove,
  touchUp,
} from "@neon-spore/render";
import type { Command } from "@neon-spore/sim";

/**
 * The stage answers a finger the way the phone does — the same `touch.ts` the
 * game calls, so the control scheme cannot disagree with itself on the screen
 * it is being judged on.
 *
 * It used to place a creature instead, which cost the editor the one thing
 * only it can answer: whether a control can actually be reached in time.
 * Placing belongs to the beat grid beside it, where a column and a beat are
 * both already visible — and where it always worked anyway.
 */
export interface StageTouch {
  canvas: HTMLCanvasElement;
  /** Read fresh: the panel is resizable and the role switches under it. */
  layout: () => Layout;
  /** The field a grab is tested against, and whose hand it is. */
  field: () => Field;
  push: (player: 1 | 2, command: Command) => void;
}

export function bindStageTouch({ canvas, layout, field, push }: StageTouch): void {
  const holding = new Map<number, Hold>();
  const at = (e: PointerEvent): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  canvas.addEventListener("pointerdown", (e) => {
    const p = at(e);
    const t = touchDown(layout(), p.x, p.y, field());
    if (!t) return;
    e.preventDefault();
    if (t.hold) holding.set(e.pointerId, t.hold);
    push(t.player, t.command);
  });
  canvas.addEventListener("pointermove", (e) => {
    const hold = holding.get(e.pointerId);
    if (!hold) return;
    const t = touchMove(layout(), hold, at(e).x);
    if (t) push(t.player, t.command);
  });
  // On the window, not the canvas: a thumb that leaves the picture still has
  // to let go of what it was holding.
  const lift = (e: PointerEvent): void => {
    const hold = holding.get(e.pointerId);
    if (!hold) return;
    holding.delete(e.pointerId);
    const t = touchUp(hold, field());
    if (t) push(t.player, t.command);
  };
  window.addEventListener("pointerup", lift);
  window.addEventListener("pointercancel", lift);
}
