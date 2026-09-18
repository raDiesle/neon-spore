import type { SimConfig, SimEvent } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { stareEye } from "./stare-shape.js";
import { showsStareWatched } from "./view-role-clocks-b.js";

/**
 * What THE STARE leaves behind a frame: the **flash** of a press it caught.
 *
 * Everything else about the boss is drawn off the world every frame — the
 * cowl, the eye, how far it has turned, the count, the seat's name
 * (`stare-draw.ts`). The catch is one tick in the simulation and the only
 * thing in the fight that *happens* rather than turns, so it is kept here
 * for THE HIVE's reason: a flash that was up for one frame would be a
 * flicker, and the pair has to see which of them it was. Cleared in
 * `Effects.reset()` (`restart.test.ts`).
 *
 * **It is drawn on the panel, over everything.** The event names the command
 * that was caught and the seat that sent it; what lights up is that seat's
 * whole panel — the band its thumb was on — in the eye's red, called last
 * of the frame from `canvas2d.ts` after the band is down, because a flash on
 * a button has to stand *on* the button. The one button among the panel's
 * is not picked out: the event carries a command kind and the band lays its
 * lobes out by control set, and a map from one to the other is a second
 * copy of the band's plan (`docs/queue.md`). On the other seat's screen
 * there is no flash: that seat did nothing, and the eye going white and the
 * hull's own breach (`breach-strike.ts`) are what it sees. Both are told
 * by the same seat predicate the look itself is drawn by.
 *
 * The burst goes out of the eye rather than the hull, on both screens: it is
 * the eye that caught the thumb.
 */

/** How fast the flash falls away — a beat and a bit at the game's tempo. */
const FLASH_DECAY = 3;
/** How much of the panel the flash is worth at its brightest. */
const FLASH_ALPHA = 0.55;

export class StareFx {
  private flashNow = 0;
  private seat: 0 | 1 | 2 = 0;

  /** How bright the flash is right now, one on the tick and falling. */
  get flash(): number {
    return this.flashNow;
  }

  /** Which seat was caught, while the flash is up. */
  get caught(): 0 | 1 | 2 {
    return this.seat;
  }

  ingest(
    events: readonly SimEvent[],
    l: Layout,
    cfg: SimConfig,
    burst: (x: number, y: number, n: number, hex: string) => void,
  ): void {
    for (const e of events) {
      if (e.type !== "stareCaught") continue;
      this.flashNow = 1;
      this.seat = e.player;
      const eye = stareEye(l, cfg);
      burst(eye.cx, eye.cy, 18, PALETTE.red);
    }
  }

  /** The flash falling away. */
  update(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this.flashNow = Math.max(0, this.flashNow - this.flashNow * FLASH_DECAY * step);
    if (this.flashNow < 0.01) {
      this.flashNow = 0;
      this.seat = 0;
    }
  }

  /** The caught seat's panel lit, over the band — see the file's head. */
  drawCaught(ctx: CanvasRenderingContext2D, l: Layout, role: ViewRole): void {
    if (this.flashNow <= 0 || this.seat === 0) return;
    if (!showsStareWatched(role, this.seat)) return;
    ctx.save();
    ctx.globalAlpha = FLASH_ALPHA * this.flashNow;
    ctx.fillStyle = PALETTE.red;
    ctx.fillRect(0, l.bandTop, l.width, l.height - l.bandTop);
    ctx.restore();
  }

  clear(): void {
    this.flashNow = 0;
    this.seat = 0;
  }
}
