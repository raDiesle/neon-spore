import {
  type Field,
  type Hold,
  type Layout,
  touchDown,
  touchMove,
  touchUp,
  type ViewRole,
} from "@neon-spore/render";
import {
  type Command,
  type SimConfig,
  type World,
  wardenCycle,
  wardenRescuer,
} from "@neon-spore/sim";

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

/**
 * Whose hand a grab on the field speaks for. `p1` and `p2` are unambiguous —
 * the role bar has already picked a seat, and the mouse is that seat's only
 * hand. `test` shows both seats on the one screen, so a grab there needs its
 * own answer, and the one real case where it matters is THE WARDEN's tether:
 * only the player who is *not* clamped this cycle may pull it
 * (`wardenRescuer`, `packages/sim/src/warden.ts`), and which player that is
 * flips every cycle — a seat fixed to player 1 would be right half the time
 * and silently refused the other half, which is exactly "only when it's near
 * the ship somehow." Every other grip has no such exclusivity
 * (`packages/sim/src/grip.ts`, either hand may hold anything), so outside the
 * tether the choice is arbitrary; player 1 keeps today's default and leaves
 * `G` — bound to player 2 in `keys.ts` — as the deliberate way to act as the
 * other seat.
 */
export function pointerSeat(role: ViewRole, world: World, cfg: SimConfig): 1 | 2 {
  if (role === "p1") return 1;
  if (role === "p2") return 2;
  if (world.boss?.kind === "warden") return wardenRescuer(wardenCycle(cfg, world.waveBeat));
  return 1;
}
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
