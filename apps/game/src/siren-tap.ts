import { type Layout, type SeatNames, sirenHit } from "@neon-spore/render";
import { briefingHolds, lostAsks, type World } from "@neon-spore/sim";
import { setSirenShown, sirenShown } from "./siren-shown.js";

export interface SirenTapOptions {
  canvas: HTMLCanvasElement;
  world: World;
  layout: () => Layout;
  inStage: (e: { clientX: number; clientY: number }) => { x: number; y: number } | null;
  /** The two people's names: a boss that pins the siren right places it by
   * the second chip's width (`render/siren-place.ts`). */
  names: () => SeatNames | undefined;
}

/**
 * A tap on the siren's bar puts it away, and a tap on the same place brings it
 * back — the owner, 17 October 2026. The menu's SIREN switch is the same
 * setting (`siren-shown.ts`).
 *
 * **Bound before the field's own listener, and it stops the press there.** A
 * finger on the bar meant the bar; without the stop, the same press would also
 * reach for whatever body happens to be standing under the top of the field.
 * It answers nothing while a guide's opening or a lost wave's screen holds the
 * field: their own buttons are what a press is for then.
 */
export function bindSirenTap(o: SirenTapOptions): void {
  o.canvas.addEventListener("pointerdown", (e) => {
    const { world } = o;
    if (world.over || briefingHolds(world) || lostAsks(world)) return;
    const p = o.inStage(e);
    if (!p || !sirenHit(o.layout(), world, p.x, p.y, o.names())) return;
    setSirenShown(!sirenShown());
    e.stopImmediatePropagation();
    e.preventDefault();
  });
}
