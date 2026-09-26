import type { SimEvent, World } from "@neon-spore/sim";
import { drawLastChances } from "./last-chance.js";
import { bodyX, type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **The shield pushing a creature back up, shown as the mistake it is.**
 *
 * The owner, 25 September 2026: a creature belongs to the cannon, and putting
 * the shield under one is the wrong answer that still saves the hull — once
 * (`sim/shield-push.ts`). So the save is not celebrated the way a warded rock
 * is. There is no DEFLECTED and no cyan flash. The shield's rim goes **red**
 * for a moment, a spray of red leaves the dome where the body bounced, and the
 * body carries **ONE LAST CHANCE** for the rest of its life (`last-chance.ts`),
 * because the shield will not answer it again.
 *
 * The red is `PALETTE.red`, the owner's word. It is also the red a shot is
 * made of, and that was weighed: the flash is on the ship's own rim and gone
 * in a little over half a second, where a shot colour is always on a body or a
 * bolt. The words are the part that stays, and they are drawn in the
 * ordinary text colour for exactly that reason.
 *
 * One clock for the rim and one for the words' pulse. Both are render time and
 * outlive their frame, so both are cleared in `clear` (`restart.test.ts`).
 */

/** How long the rim stays red, in seconds. Long enough to be caught out of
 * the corner of an eye, short enough to be over before the body tops out. */
const WRONG_LIFE = 0.6;
/** Particles thrown off the dome on the push, `deflect`'s own count. */
const SPRAY = 12;

export class ShieldPushFx {
  private left = 0;
  private time = 0;

  /** 0..1, how red the shield's rim is this frame. */
  get wrong(): number {
    return this.left / WRONG_LIFE;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    for (const e of events) {
      if (e.type !== "shieldPush") continue;
      this.left = WRONG_LIFE;
      burst(bodyX(l, e.col, e.row), tileCY(l, e.row), SPRAY, PALETTE.red);
    }
  }

  update(dt: number): void {
    this.left = Math.max(0, this.left - dt);
    this.time += dt;
  }

  /** The words, over every body the shield has already pushed. */
  draw(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    drawLastChances(ctx, l, world, beatPhase, this.time);
  }

  clear(): void {
    this.left = 0;
    this.time = 0;
  }
}
